// debug-connection.js - Run this script to test your backend connection
const http = require('http');
const https = require('https');

console.log('🔍 Starting Connection Debug Tests...\n');

// Test 1: Basic HTTP connection to backend
function testBackendConnection() {
  return new Promise((resolve) => {
    console.log('1️⃣  Testing backend connection...');
    
    const req = http.request('http://localhost:5000', (res) => {
      console.log('✅ Backend is reachable');
      console.log('   Status:', res.statusCode);
      console.log('   Headers:', JSON.stringify(res.headers, null, 2));
      resolve(true);
    });

    req.on('error', (err) => {
      console.log('❌ Backend connection failed:');
      console.log('   Error:', err.message);
      console.log('   Code:', err.code);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Backend connection timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test 2: Test API endpoint
function testAPIEndpoint() {
  return new Promise((resolve) => {
    console.log('\n2️⃣  Testing API endpoint...');
    
    const req = http.request('http://localhost:5000/api/phones', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ API endpoint responded');
        console.log('   Status:', res.statusCode);
        console.log('   Response length:', data.length, 'bytes');
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log('❌ API endpoint failed:');
      console.log('   Error:', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ API endpoint timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test 3: Port availability
function testPortAvailability() {
  return new Promise((resolve) => {
    console.log('\n3️⃣  Testing port availability...');
    
    const server = http.createServer();
    
    server.listen(5000, () => {
      console.log('❌ Port 5000 is available (your backend might not be running!)');
      server.close();
      resolve(false);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('✅ Port 5000 is in use (good - backend should be running)');
        resolve(true);
      } else {
        console.log('❌ Port test error:', err.message);
        resolve(false);
      }
    });
  });
}

// Test 4: Network interface check
function checkNetworkInterfaces() {
  console.log('\n4️⃣  Network interfaces:');
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (!iface.internal && iface.family === 'IPv4') {
        console.log(`   ${name}: ${iface.address}`);
      }
    });
  });
}

// Run all tests
async function runAllTests() {
  const backendReachable = await testBackendConnection();
  const apiWorking = await testAPIEndpoint();
  const portInUse = await testPortAvailability();
  
  checkNetworkInterfaces();

  console.log('\n📊 Test Summary:');
  console.log('   Backend reachable:', backendReachable ? '✅' : '❌');
  console.log('   API working:', apiWorking ? '✅' : '❌');
  console.log('   Port in use:', portInUse ? '✅' : '❌');

  console.log('\n💡 Recommendations:');
  
  if (!portInUse) {
    console.log('   • Your backend server is not running on port 5000');
    console.log('   • Start your backend with: node server.js');
  } else if (!backendReachable) {
    console.log('   • Backend is running but not responding');
    console.log('   • Check server logs for errors');
    console.log('   • Try restarting the backend server');
  } else if (!apiWorking) {
    console.log('   • Backend is running but API routes have issues');
    console.log('   • Check your route configurations');
  } else {
    console.log('   • Backend seems fine - issue might be in frontend');
    console.log('   • Check browser console for errors');
    console.log('   • Verify REACT_APP_API_URL environment variable');
  }
}

runAllTests().catch(console.error);