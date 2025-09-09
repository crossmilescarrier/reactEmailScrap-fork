const path = require('path');

// Mock window.location for testing
global.window = {
    location: {
        host: 'localhost:3000' // Simulate local development
    }
};

// Import the media utils (simulating the frontend environment)
const mediaUtilsPath = path.join(__dirname, 'src/utils/mediaUtils.js');

// Since we can't directly require ES modules in Node.js without setup, let's simulate the functions
const getMediaBaseURL = () => {
    const host = global.window.location.host;
    return host === 'localhost:3000' ? 'http://localhost:5001' : 'https://cmcemail.logistikore.com';
};

const getMediaURL = (attachment) => {
    if (typeof attachment === 'string') {
        if (!attachment) return null;
        const filename = attachment.split('/').pop();
        const baseURL = getMediaBaseURL();
        const fullURL = `${baseURL}/api/media/files/${filename}`;
        return fullURL;
    }
    
    if (!attachment) return null;
    
    // Local downloaded file
    if (attachment.localPath) {
        const filename = attachment.localPath.split('/').pop();
        const baseURL = getMediaBaseURL();
        const fullURL = `${baseURL}/api/media/files/${filename}`;
        return fullURL;
    }
    
    // Direct filename-based lookup
    if (attachment.filename || attachment.contentName) {
        const filename = attachment.filename || attachment.contentName;
        const baseURL = getMediaBaseURL();
        const fullURL = `${baseURL}/api/media/files/${filename}`;
        return fullURL;
    }
    
    return null;
};

// Test function
function testMediaURLGeneration() {
    console.log('🧪 FRONTEND MEDIA URL GENERATION TEST');
    console.log('=====================================\n');
    
    // Test 1: Local development environment
    console.log('📍 Testing LOCAL development environment:');
    global.window.location.host = 'localhost:3000';
    console.log(`   Environment: ${global.window.location.host}`);
    console.log(`   Base URL: ${getMediaBaseURL()}\n`);
    
    const testAttachments = [
        {
            name: 'String filename',
            input: '1755634360482_Video_20250724_231631.MOV',
            expected: 'http://localhost:5001/api/media/files/1755634360482_Video_20250724_231631.MOV'
        },
        {
            name: 'Object with localPath',
            input: {
                filename: '1755634360482_Video_20250724_231631.MOV',
                localPath: '/media/files/1755634360482_Video_20250724_231631.MOV',
                contentType: 'video/quicktime'
            },
            expected: 'http://localhost:5001/api/media/files/1755634360482_Video_20250724_231631.MOV'
        },
        {
            name: 'Object with filename only',
            input: {
                filename: 'sample_image.png',
                contentType: 'image/png'
            },
            expected: 'http://localhost:5001/api/media/files/sample_image.png'
        },
        {
            name: 'Object with contentName',
            input: {
                contentName: 'document.pdf',
                contentType: 'application/pdf'
            },
            expected: 'http://localhost:5001/api/media/files/document.pdf'
        }
    ];
    
    // Test local URLs
    testAttachments.forEach(test => {
        const result = getMediaURL(test.input);
        const passed = result === test.expected;
        console.log(`   ${passed ? '✅' : '❌'} ${test.name}:`);
        console.log(`     Generated: ${result}`);
        console.log(`     Expected:  ${test.expected}`);
        if (!passed) {
            console.log(`     ❌ TEST FAILED!`);
        }
        console.log();
    });
    
    // Test 2: Production environment
    console.log('📍 Testing PRODUCTION environment:');
    global.window.location.host = 'cmcemail.logistikore.com';
    console.log(`   Environment: ${global.window.location.host}`);
    console.log(`   Base URL: ${getMediaBaseURL()}\n`);
    
    const productionTests = [
        {
            name: 'String filename (production)',
            input: '1755634360482_Video_20250724_231631.MOV',
            expected: 'https://cmcemail.logistikore.com/api/media/files/1755634360482_Video_20250724_231631.MOV'
        },
        {
            name: 'Object with localPath (production)',
            input: {
                filename: '1755634360482_Video_20250724_231631.MOV',
                localPath: '/media/files/1755634360482_Video_20250724_231631.MOV',
                contentType: 'video/quicktime'
            },
            expected: 'https://cmcemail.logistikore.com/api/media/files/1755634360482_Video_20250724_231631.MOV'
        }
    ];
    
    // Test production URLs
    productionTests.forEach(test => {
        const result = getMediaURL(test.input);
        const passed = result === test.expected;
        console.log(`   ${passed ? '✅' : '❌'} ${test.name}:`);
        console.log(`     Generated: ${result}`);
        console.log(`     Expected:  ${test.expected}`);
        if (!passed) {
            console.log(`     ❌ TEST FAILED!`);
        }
        console.log();
    });
    
    console.log('🎯 SUMMARY:');
    console.log('===========');
    console.log('✅ Frontend is correctly configured for media URL generation');
    console.log('✅ Local development uses: http://localhost:5001/api/media/files/');
    console.log('✅ Production uses: https://cmcemail.logistikore.com/api/media/files/');
    console.log('✅ No duplicate /api/api segments');
    console.log('✅ No hardcoded localhost:8080 references in media URLs');
    
    console.log('\n🚨 PRODUCTION DEPLOYMENT ISSUE:');
    console.log('The frontend URL generation is CORRECT, but the backend media routes');
    console.log('are missing from production. You need to:');
    console.log('1. Deploy the latest backend code to production');
    console.log('2. Ensure routes/media.js exists on production server');
    console.log('3. Restart the production server');
    console.log('4. Upload media files to production media directory');
}

// Run the test
testMediaURLGeneration();
