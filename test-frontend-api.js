const fetch = require('node-fetch');

async function testApiEndpoints() {
    try {
        const accountEmail = 'naveendev@crossmilescarrier.com';
        
        console.log('Testing API endpoints for participant names...\n');
        
        // Test the regular API endpoint (used by frontend)
        console.log('1. Testing /account/:accountEmail/chats endpoint (frontend uses this):');
        try {
            const response1 = await fetch(`http://localhost:5001/account/${accountEmail}/chats?limit=10`);
            const data1 = await response1.json();
            
            if (data1.status) {
                console.log('✅ Endpoint working');
                const relevantChats = data1.data.chats.filter(chat => 
                    chat.title === 'Ravi' || chat.title === 'Unknown Contact' || chat.title === 'Google Drive Bot'
                );
                console.log('Relevant chats found:');
                relevantChats.forEach(chat => {
                    console.log(`  - ${chat.title} (participants: ${chat.participants.join(', ')})`);
                });
            } else {
                console.log('❌ API returned error:', data1.message);
            }
        } catch (error) {
            console.log('❌ Request failed:', error.message);
        }
        
        console.log('\n2. Testing /test/account/:accountEmail/chats endpoint (our test endpoint):');
        try {
            const response2 = await fetch(`http://localhost:5001/test/account/${accountEmail}/chats`);
            const data2 = await response2.json();
            
            if (data2.status) {
                console.log('✅ Endpoint working');
                const relevantChats = data2.data.chats.filter(chat => 
                    chat.title === 'Ravi' || chat.title === 'Unknown Contact' || chat.title === 'Google Drive Bot'
                );
                console.log('Relevant chats found:');
                relevantChats.forEach(chat => {
                    console.log(`  - ${chat.title} (participants: ${chat.participants.join(', ')})`);
                });
            } else {
                console.log('❌ API returned error:', data2.message);
            }
        } catch (error) {
            console.log('❌ Request failed:', error.message);
        }
        
        console.log('\n3. Testing with authentication (if needed):');
        // Check if the frontend endpoint requires authentication
        try {
            const response3 = await fetch(`http://localhost:5001/account/${accountEmail}/chats?limit=10`, {
                headers: {
                    'Authorization': 'Bearer fake-token'
                }
            });
            const data3 = await response3.json();
            console.log('Response with auth header:', data3.status ? 'Success' : `Error: ${data3.message}`);
        } catch (error) {
            console.log('Request with auth failed:', error.message);
        }
        
        console.log('\n4. Direct database check:');
        // Quick check of what's in the database
        const { Chat } = require('./db');
        const directChats = await Chat.find({ 
            accountEmail,
            title: { $in: ['Ravi', 'Unknown Contact', 'Google Drive Bot'] }
        }).select('title participants').limit(5);
        
        console.log('Direct database results:');
        directChats.forEach(chat => {
            console.log(`  - ${chat.title} (participants: ${chat.participants.join(', ')})`);
        });
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testApiEndpoints().then(() => {
    console.log('\nTest completed!');
    process.exit(0);
}).catch(console.error);
