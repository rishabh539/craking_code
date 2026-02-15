/**
 * Multi-User Concurrent Test Script
 * Tests that multiple users can log in, maintain sessions, and access data independently
 * 
 * Usage: node test-multiuser.js
 * Requires: Backend running on http://localhost:5000
 */

const BASE_URL = 'http://localhost:5000/api';

// Test users - these should already exist in the database
// If they don't exist, the script will try to register them first
const TEST_USERS = {
    student: {
        name: 'Test Student',
        email: 'teststudent@college.edu',
        password: 'Test@12345',
        role: 'student',
        rollNumber: 'TEST2024S001',
        department: 'Computer Science',
        identifier: 'TEST2024S001'
    },
    faculty: {
        name: 'Test Faculty',
        email: 'testfaculty@college.edu',
        password: 'Test@12345',
        role: 'faculty',
        employeeId: 'TESTEMP001',
        department: 'Computer Science',
        identifier: 'TESTEMP001'
    },
    admin: {
        name: 'Test Admin',
        email: 'testadmin@college.edu',
        password: 'Test@12345',
        role: 'admin',
        employeeId: 'TESTADM001',
        department: 'Administration',
        identifier: 'TESTADM001'
    }
};

let passed = 0;
let failed = 0;

function log(type, msg) {
    const icons = { pass: '✅', fail: '❌', info: 'ℹ️', test: '🧪' };
    console.log(`${icons[type] || '  '} ${msg}`);
}

async function fetchJSON(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    const data = await res.json();
    return { status: res.status, data };
}

async function registerUser(user) {
    try {
        const { status, data } = await fetchJSON(`${BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(user)
        });
        if (status === 201) {
            log('info', `Registered ${user.role}: ${user.name}`);
            return data;
        }
        // User might already exist, that's OK
        return null;
    } catch (e) {
        return null;
    }
}

async function loginUser(user) {
    const { status, data } = await fetchJSON(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ identifier: user.identifier, password: user.password })
    });
    if (status === 200 && data.token) {
        return data;
    }
    throw new Error(`Login failed for ${user.role}: ${JSON.stringify(data)}`);
}

function assert(condition, testName) {
    if (condition) {
        log('pass', testName);
        passed++;
    } else {
        log('fail', testName);
        failed++;
    }
}

async function runTests() {
    console.log('\n========================================');
    console.log('  MULTI-USER CONCURRENT TEST SUITE');
    console.log('========================================\n');

    // Step 1: Register test users (if they don't exist)
    log('test', 'STEP 1: Registering test users...');
    for (const key of Object.keys(TEST_USERS)) {
        await registerUser(TEST_USERS[key]);
    }
    console.log('');

    // Step 2: Login ALL users concurrently
    log('test', 'STEP 2: Concurrent login for all 3 users...');
    let sessions;
    try {
        sessions = await Promise.all([
            loginUser(TEST_USERS.student),
            loginUser(TEST_USERS.faculty),
            loginUser(TEST_USERS.admin)
        ]);
        assert(sessions.length === 3, 'All 3 users logged in concurrently');
    } catch (e) {
        log('fail', `Concurrent login failed: ${e.message}`);
        failed++;
        return printSummary();
    }

    const [studentSession, facultySession, adminSession] = sessions;

    // Step 3: Verify each user has a UNIQUE token
    log('test', 'STEP 3: Verifying unique tokens...');
    assert(
        studentSession.token !== facultySession.token &&
        facultySession.token !== adminSession.token &&
        studentSession.token !== adminSession.token,
        'All 3 users received unique JWT tokens'
    );
    console.log('');

    // Step 4: Verify each token returns the CORRECT user via /auth/me
    log('test', 'STEP 4: Verifying session isolation via /auth/me...');
    const [studentMe, facultyMe, adminMe] = await Promise.all([
        fetchJSON(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${studentSession.token}` } }),
        fetchJSON(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${facultySession.token}` } }),
        fetchJSON(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${adminSession.token}` } })
    ]);

    assert(studentMe.data.role === 'student', `Student /me returns role='student' (got: ${studentMe.data.role})`);
    assert(facultyMe.data.role === 'faculty', `Faculty /me returns role='faculty' (got: ${facultyMe.data.role})`);
    assert(adminMe.data.role === 'admin', `Admin /me returns role='admin' (got: ${adminMe.data.role})`);

    assert(studentMe.data._id === studentSession._id, 'Student session returns correct user ID');
    assert(facultyMe.data._id === facultySession._id, 'Faculty session returns correct user ID');
    assert(adminMe.data._id === adminSession._id, 'Admin session returns correct user ID');
    console.log('');

    // Step 5: Test cross-role access (student tries admin route)
    log('test', 'STEP 5: Testing RBAC - cross-role access prevention...');
    const studentTriesAdmin = await fetchJSON(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${studentSession.token}` }
    });
    assert(studentTriesAdmin.status === 403, `Student blocked from admin /users route (status: ${studentTriesAdmin.status})`);

    const facultyTriesAdmin = await fetchJSON(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${facultySession.token}` }
    });
    assert(facultyTriesAdmin.status === 403, `Faculty blocked from admin /users route (status: ${facultyTriesAdmin.status})`);

    const adminAccessesUsers = await fetchJSON(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    assert(adminAccessesUsers.status === 200, `Admin can access /users route (status: ${adminAccessesUsers.status})`);
    console.log('');

    // Step 6: Test session independence (login as new user doesn't invalidate others)
    log('test', 'STEP 6: Testing session independence after new login...');
    // Login student again (new token)
    const studentRelogin = await loginUser(TEST_USERS.student);
    assert(studentRelogin.token !== studentSession.token, 'Re-login generates a new unique token');

    // Verify old student token still works (JWT is stateless, old token should still be valid)
    const oldTokenCheck = await fetchJSON(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${studentSession.token}` }
    });
    assert(oldTokenCheck.status === 200, 'Old student token still valid after re-login (stateless JWT)');

    // Verify faculty and admin sessions are unaffected
    const facultyStillValid = await fetchJSON(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${facultySession.token}` }
    });
    assert(facultyStillValid.status === 200, 'Faculty session unaffected by student re-login');

    const adminStillValid = await fetchJSON(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    assert(adminStillValid.status === 200, 'Admin session unaffected by student re-login');
    console.log('');

    // Step 7: Test no token access
    log('test', 'STEP 7: Testing unauthenticated access...');
    const noTokenAccess = await fetchJSON(`${BASE_URL}/auth/me`);
    assert(noTokenAccess.status === 401, `No token → 401 unauthorized (status: ${noTokenAccess.status})`);

    const invalidTokenAccess = await fetchJSON(`${BASE_URL}/auth/me`, {
        headers: { Authorization: 'Bearer invalid.token.here' }
    });
    assert(invalidTokenAccess.status === 401, `Invalid token → 401 unauthorized (status: ${invalidTokenAccess.status})`);
    console.log('');

    // Step 8: Concurrent data access
    log('test', 'STEP 8: Testing concurrent data access...');
    const concurrentResults = await Promise.all([
        fetchJSON(`${BASE_URL}/grievances`, { headers: { Authorization: `Bearer ${studentSession.token}` } }),
        fetchJSON(`${BASE_URL}/grievances`, { headers: { Authorization: `Bearer ${facultySession.token}` } }),
        fetchJSON(`${BASE_URL}/grievances`, { headers: { Authorization: `Bearer ${adminSession.token}` } }),
        fetchJSON(`${BASE_URL}/announcements`, { headers: { Authorization: `Bearer ${studentSession.token}` } }),
        fetchJSON(`${BASE_URL}/announcements`, { headers: { Authorization: `Bearer ${facultySession.token}` } }),
    ]);

    const allSucceeded = concurrentResults.every(r => r.status === 200);
    assert(allSucceeded, `5 concurrent API requests from 3 users all returned 200`);
    console.log('');

    printSummary();
}

function printSummary() {
    console.log('========================================');
    console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
    console.log('========================================\n');

    if (failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Multi-user system is working correctly.\n');
    } else {
        console.log('⚠️  Some tests failed. Review the output above for details.\n');
    }

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Test suite crashed:', err);
    process.exit(1);
});
