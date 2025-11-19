// benchmark.js
import Benchmark from 'benchmark';
import axios from 'axios';
import mongoose from 'mongoose';

// Connect to MongoDB (replace with your connection string)
const MONGO_URI = "mongodb+srv://shresthaumesh276_db_user:z3Ag0i5MmBWDiV6E@crud.gxvlnyr.mongodb.net/quizversus_db";
await mongoose.connect(MONGO_URI);

// Define a sample schema and model for database testing
const TestSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model('Test', TestSchema);

const suite = new Benchmark.Suite;

// Example functions to benchmark
function processDataMethod1(data) {
    // Simulate some processing
    return data.map(item => item * 2);
}

function processDataMethod2(data) {
    // Simulate some alternative processing
    let result = [];
    for (let i = 0; i < data.length; i++) {
        result.push(data[i] + data[i]);
    }
    return result;
}

// Simulate network latency test
async function simulateNetworkRequest() {
    try {
        const response = await axios.post('http://localhost:8000/api/auth/login'); // Example API
        return response.data;
    } catch (error) {
        console.error('Network request failed:', error);
    }
}

// Simulate database access test
async function simulateDatabaseAccess() {
    try {
        // Insert a document
        const doc = new TestModel({ name: 'Benchmark Test' });
        await doc.save();

        // Retrieve the document
        const result = await TestModel.findOne({ name: 'Benchmark Test' });

        // Clean up
        await TestModel.deleteOne({ _id: result._id });
        return result;
    } catch (error) {
        console.error('Database access failed:', error);
    }
}

// Add tests to the suite
suite.add('Process Data Method 1', function() {
    const testData = Array.from({ length: 1000 }, (_, i) => i);
    processDataMethod1(testData);
})
.add('Process Data Method 2', function() {
    const testData = Array.from({ length: 1000 }, (_, i) => i);
    processDataMethod2(testData);
})
.add('Network Latency Test', {
    defer: true, // Use deferred mode for async operations
    fn: async function(deferred) {
        await simulateNetworkRequest();
        deferred.resolve();
    }
})
.add('Database Access Test', {
    defer: true, // Use deferred mode for async operations
    fn: async function(deferred) {
        await simulateDatabaseAccess();
        deferred.resolve();
    }
})
// Add listeners
.on('cycle', function(event) {
    console.log(String(event.target));
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// Run async
.run({ 'async': true });