const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');

class WebSocketTester {
    constructor() {
        this.socket = null;
        this.testResults = {
            startTime: new Date().toISOString(),
            endTime: null,
            totalTests: 10,
            passedTests: 0,
            failedTests: 0,
            connectionStatus: 'disconnected',
            conversations: [],
            errors: [],
            responseMetrics: {
                averageResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0,
                totalResponseTime: 0
            }
        };
        this.currentTestIndex = 0;
        this.pendingResponses = new Map();
        
        this.testMessages = [
            {
                id: 'test-001',
                message: '안녕하세요',
                description: 'Korean greeting test',
                expectedKeywords: ['안녕', '도와드릴', '무엇']
            },
            {
                id: 'test-002',
                message: '쇼핑몰 개발해주세요',
                description: 'Shopping mall development request',
                expectedKeywords: ['쇼핑몰', '개발', '카탈로그', '결제']
            },
            {
                id: 'test-003',
                message: 'React 컴포넌트 만들어주세요',
                description: 'React component creation request',
                expectedKeywords: ['React', '컴포넌트', '개발']
            },
            {
                id: 'test-004',
                message: '새 프로젝트 만들어주세요',
                description: 'New project creation request',
                expectedKeywords: ['프로젝트', '새', '만들']
            },
            {
                id: 'test-005',
                message: '현재 프로젝트 상태는?',
                description: 'Project status inquiry',
                expectedKeywords: ['상태', '프로젝트', '현재']
            },
            {
                id: 'test-006',
                message: '로그인 시스템 구현해주세요',
                description: 'Authentication system request',
                expectedKeywords: ['로그인', '시스템', '구현']
            },
            {
                id: 'test-007',
                message: 'API 서버 개발이 필요합니다',
                description: 'API server development request',
                expectedKeywords: ['API', '서버', '개발']
            },
            {
                id: 'test-008',
                message: '데이터베이스 설계 도움을 주세요',
                description: 'Database design assistance',
                expectedKeywords: ['데이터베이스', '설계', '도움']
            },
            {
                id: 'test-009',
                message: '모바일 앱 개발 계획',
                description: 'Mobile app development planning',
                expectedKeywords: ['모바일', '앱', '개발', '계획']
            },
            {
                id: 'test-010',
                message: '테스트 완료되었나요?',
                description: 'Test completion inquiry',
                expectedKeywords: ['테스트', '완료']
            }
        ];
    }

    async connect() {
        return new Promise((resolve, reject) => {
            console.log('🔗 Connecting to WebSocket server at http://localhost:8089...');
            
            this.socket = io('http://localhost:8089', {
                transports: ['polling', 'websocket'],
                autoConnect: true,
                timeout: 10000,
                reconnection: false
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to WebSocket server');
                this.testResults.connectionStatus = 'connected';
                this.setupEventHandlers();
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.log('❌ Connection failed:', error.message);
                this.testResults.connectionStatus = 'error';
                this.testResults.errors.push({
                    type: 'connection_error',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
                reject(error);
            });

            setTimeout(() => {
                if (this.testResults.connectionStatus !== 'connected') {
                    reject(new Error('Connection timeout'));
                }
            }, 15000);
        });
    }

    setupEventHandlers() {
        this.socket.on('message', (data) => {
            this.handleMessage(data);
        });

        this.socket.on('typing', (isTyping) => {
            console.log(`⌨️  Server typing: ${isTyping}`);
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
            this.testResults.connectionStatus = 'disconnected';
        });

        this.socket.on('welcome', (data) => {
            console.log('👋 Welcome message received:', data.message);
        });
    }

    handleMessage(data) {
        if (data.type === 'message' && data.payload) {
            const messageId = this.findPendingMessage(data.payload.content);
            if (messageId) {
                const pendingTest = this.pendingResponses.get(messageId);
                if (pendingTest) {
                    const responseTime = Date.now() - pendingTest.sentAt;
                    this.recordResponse(messageId, data.payload, responseTime);
                    this.pendingResponses.delete(messageId);
                }
            } else {
                console.log('📨 Received unexpected message:', data.payload.content);
            }
        } else if (data.type === 'error') {
            this.testResults.errors.push({
                type: 'message_error',
                message: data.payload.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    findPendingMessage(responseContent) {
        // Try to match response to pending message based on content or context
        for (const [messageId, testData] of this.pendingResponses) {
            return messageId; // For now, assume first pending message
        }
        return null;
    }

    recordResponse(testId, responsePayload, responseTime) {
        const testData = this.testMessages.find(t => t.id === testId);
        const conversation = {
            testId: testId,
            description: testData?.description || 'Unknown test',
            userMessage: testData?.message || 'Unknown message',
            aiResponse: responsePayload.content,
            responseTime: responseTime,
            timestamp: new Date().toISOString(),
            success: true,
            keywordMatch: this.checkKeywords(responsePayload.content, testData?.expectedKeywords || [])
        };

        this.testResults.conversations.push(conversation);
        this.updateMetrics(responseTime);
        this.testResults.passedTests++;

        console.log(`✅ Test ${testId} completed - Response time: ${responseTime}ms`);
        console.log(`   User: ${conversation.userMessage}`);
        console.log(`   AI: ${responsePayload.content.substring(0, 100)}...`);
        console.log(`   Keywords found: ${conversation.keywordMatch}/=${testData?.expectedKeywords?.length || 0}`);
        console.log('');
    }

    checkKeywords(response, keywords) {
        return keywords.filter(keyword => 
            response.toLowerCase().includes(keyword.toLowerCase())
        ).length;
    }

    updateMetrics(responseTime) {
        this.testResults.responseMetrics.totalResponseTime += responseTime;
        this.testResults.responseMetrics.minResponseTime = Math.min(
            this.testResults.responseMetrics.minResponseTime, 
            responseTime
        );
        this.testResults.responseMetrics.maxResponseTime = Math.max(
            this.testResults.responseMetrics.maxResponseTime, 
            responseTime
        );
        this.testResults.responseMetrics.averageResponseTime = 
            this.testResults.responseMetrics.totalResponseTime / this.testResults.passedTests;
    }

    async sendMessage(testMessage) {
        return new Promise((resolve, reject) => {
            const messageData = {
                type: 'user_message',
                payload: {
                    content: testMessage.message,
                    projectId: 'test-project-' + Date.now()
                }
            };

            console.log(`📤 Sending test ${testMessage.id}: ${testMessage.message}`);
            
            this.pendingResponses.set(testMessage.id, {
                sentAt: Date.now(),
                testData: testMessage
            });

            this.socket.emit('message', messageData);

            // Set timeout for response
            setTimeout(() => {
                if (this.pendingResponses.has(testMessage.id)) {
                    this.pendingResponses.delete(testMessage.id);
                    this.testResults.failedTests++;
                    this.testResults.errors.push({
                        type: 'timeout',
                        testId: testMessage.id,
                        message: `No response received for test ${testMessage.id}`,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`⏰ Test ${testMessage.id} timed out`);
                    reject(new Error(`Test ${testMessage.id} timed out`));
                } else {
                    resolve();
                }
            }, 15000); // 15 second timeout
        });
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive WebSocket test suite...');
        console.log(`📊 Total tests to run: ${this.testMessages.length}\n`);

        for (const testMessage of this.testMessages) {
            try {
                await this.sendMessage(testMessage);
                // Wait between tests
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.log(`❌ Test ${testMessage.id} failed:`, error.message);
            }
        }

        // Wait for any remaining responses
        console.log('⏳ Waiting for remaining responses...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        this.finishTests();
    }

    finishTests() {
        this.testResults.endTime = new Date().toISOString();
        
        // Mark any remaining pending tests as failed
        for (const [messageId, testData] of this.pendingResponses) {
            this.testResults.failedTests++;
            this.testResults.errors.push({
                type: 'no_response',
                testId: messageId,
                message: `No response received for test ${messageId}`,
                timestamp: new Date().toISOString()
            });
        }

        this.generateReport();
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 WEBSOCKET TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`🏁 Test Execution Completed`);
        console.log(`⏰ Start Time: ${this.testResults.startTime}`);
        console.log(`🏁 End Time: ${this.testResults.endTime}`);
        console.log(`🔗 Connection Status: ${this.testResults.connectionStatus}`);
        console.log('');
        
        console.log(`📊 Test Results:`);
        console.log(`   Total Tests: ${this.testResults.totalTests}`);
        console.log(`   ✅ Passed: ${this.testResults.passedTests}`);
        console.log(`   ❌ Failed: ${this.testResults.failedTests}`);
        console.log(`   📈 Success Rate: ${((this.testResults.passedTests / this.testResults.totalTests) * 100).toFixed(1)}%`);
        console.log('');

        if (this.testResults.passedTests > 0) {
            console.log(`⚡ Response Metrics:`);
            console.log(`   Average Response Time: ${this.testResults.responseMetrics.averageResponseTime.toFixed(0)}ms`);
            console.log(`   Fastest Response: ${this.testResults.responseMetrics.minResponseTime}ms`);
            console.log(`   Slowest Response: ${this.testResults.responseMetrics.maxResponseTime}ms`);
            console.log('');
        }

        if (this.testResults.errors.length > 0) {
            console.log(`⚠️  Errors Encountered: ${this.testResults.errors.length}`);
            this.testResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.type}: ${error.message}`);
            });
            console.log('');
        }

        console.log(`💬 Conversation Summary:`);
        this.testResults.conversations.forEach((conv, index) => {
            console.log(`   ${index + 1}. ${conv.description} (${conv.responseTime}ms)`);
            console.log(`      Keywords matched: ${conv.keywordMatch}/${conv.testId.includes('test-') ? this.testMessages.find(t => t.id === conv.testId)?.expectedKeywords?.length || 0 : 0}`);
        });

        // Save detailed results to file
        const fileName = `test-results-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`;
        const filePath = path.join(__dirname, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(this.testResults, null, 2));
        console.log(`\n💾 Detailed results saved to: ${fileName}`);
        
        console.log('='.repeat(60));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Run the test
async function main() {
    const tester = new WebSocketTester();
    
    try {
        await tester.connect();
        await tester.runAllTests();
    } catch (error) {
        console.error('🔥 Test execution failed:', error.message);
        tester.testResults.errors.push({
            type: 'execution_error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
        tester.generateReport();
    } finally {
        tester.disconnect();
        process.exit(0);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main();