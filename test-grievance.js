// Quick test script to verify backend grievance API
// Run this in browser console after logging in

const testGrievance = async () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Current user:', user);

        if (!user || !user.token) {
            console.error('No user logged in!');
            return;
        }

        const response = await fetch('http://localhost:5000/api/grievances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                title: 'Test Grievance',
                description: 'This is a test grievance',
                category: 'Academic',
                priority: 'Medium',
                location: 'Test Location',
                isAnonymous: false
            })
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
            console.log('✅ Grievance submitted successfully!');
        } else {
            console.error('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
};

// Run the test
testGrievance();
