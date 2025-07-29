const io = require('socket.io-client');
const fs = require('fs');

class ProjectCreationTester {
    constructor() {
        this.socket = null;
        this.results = {
            startTime: new Date().toISOString(),
            endTime: null,
            connectionStatus: 'disconnected',
            projectCreationTests: [],
            errors: []
        };
    }

    async connect() {
        return new Promise((resolve, reject) => {
            console.log('🔗 Connecting to backend for project creation test...');
            
            this.socket = io('http://localhost:8089', {
                transports: ['polling', 'websocket'],
                autoConnect: true,
                timeout: 10000,
                reconnection: false
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected successfully');
                this.results.connectionStatus = 'connected';
                this.setupEventHandlers();
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.log('❌ Connection failed:', error.message);
                this.results.connectionStatus = 'error';
                reject(error);
            });
        });
    }

    setupEventHandlers() {
        this.socket.on('message', (data) => {
            console.log('📨 Received:', data.type, data.payload?.content?.substring(0, 100));
        });

        this.socket.on('project_update', (data) => {
            console.log('🏗️ Project update received:', data);
            this.results.projectCreationTests.push({
                type: 'project_update',
                data: data,
                timestamp: new Date().toISOString(),
                success: true
            });
        });

        this.socket.on('typing', (isTyping) => {
            console.log(`⌨️ Typing: ${isTyping}`);
        });
    }

    async testProjectCreation() {
        console.log('🏗️ Testing project creation functionality...');
        
        const projectRequests = [
            'E-commerce 웹사이트 프로젝트를 생성해주세요',
            '새로운 React 프로젝트를 만들어주세요',
            'Node.js API 서버 프로젝트 생성'
        ];

        for (const request of projectRequests) {
            console.log(`📤 Sending: ${request}`);
            
            this.socket.emit('message', {
                type: 'user_message',
                payload: {
                    content: request,
                    projectId: 'test-project-' + Date.now()
                }
            });

            // Wait for response
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Test project action
        console.log('🎯 Testing project action...');
        this.socket.emit('project_action', {
            action: 'create_project',
            payload: {
                name: 'Test Project',
                type: 'web_application',
                description: 'Automated test project creation'
            }
        });

        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    generateReport() {
        this.results.endTime = new Date().toISOString();
        
        console.log('\n' + '='.repeat(50));
        console.log('🏗️ PROJECT CREATION TEST RESULTS');
        console.log('='.repeat(50));
        console.log(`Connection Status: ${this.results.connectionStatus}`);
        console.log(`Project Updates Received: ${this.results.projectCreationTests.length}`);
        console.log(`Errors: ${this.results.errors.length}`);
        
        if (this.results.projectCreationTests.length > 0) {
            console.log('\n📋 Project Updates:');
            this.results.projectCreationTests.forEach((test, index) => {
                console.log(`${index + 1}. ${test.type} - ${test.timestamp}`);
            });
        }
        
        const fileName = `project-test-results-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`;
        fs.writeFileSync(fileName, JSON.stringify(this.results, null, 2));
        console.log(`💾 Results saved to: ${fileName}`);
        console.log('='.repeat(50));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

async function main() {
    const tester = new ProjectCreationTester();
    
    try {
        await tester.connect();
        await tester.testProjectCreation();
        tester.generateReport();
    } catch (error) {
        console.error('Test failed:', error.message);
        tester.generateReport();
    } finally {
        tester.disconnect();
        process.exit(0);
    }
}

main();