require('dotenv').config();
const AWS = require('aws-sdk');

async function checkAWSCredentials() {
    console.log('🔍 Checking AWS credentials...\n');

    // 1. Check environment variables
    console.log('1. Checking environment variables:');
    const requiredVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN'];
    let missingVars = [];

    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        } else {
            const value = varName === 'AWS_SECRET_ACCESS_KEY' || varName === 'AWS_SESSION_TOKEN' 
                ? '****' 
                : process.env[varName];
            console.log(`   ✓ ${varName} = ${value}`);
        }
    });

    if (missingVars.length > 0) {
        console.log('\n❌ Missing environment variables:', missingVars.join(', '));
        return false;
    }

    // 2. Configure AWS SDK
    try {
        AWS.config.update({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        });

        console.log('\n2. AWS SDK configured successfully');

        // 3. Test DynamoDB connection
        console.log('\n3. Testing DynamoDB connection:');
        const dynamodb = new AWS.DynamoDB();
        
        console.log('   Listing tables...');
        const tables = await dynamodb.listTables().promise();
        console.log('   ✓ Connected to DynamoDB successfully');
        console.log('   ✓ Available tables:', tables.TableNames);

        // 4. Check table structure
        console.log('\n4. Checking table structure:');
        for (const tableName of tables.TableNames) {
            console.log(`\n   Checking table: ${tableName}`);
            const tableInfo = await dynamodb.describeTable({ TableName: tableName }).promise();
            
            console.log('   ✓ Primary key structure:');
            tableInfo.Table.KeySchema.forEach(key => {
                console.log(`     - ${key.AttributeName} (${key.KeyType})`);
            });
            
            console.log('   ✓ Provisioned throughput:');
            console.log(`     - Read capacity: ${tableInfo.Table.ProvisionedThroughput.ReadCapacityUnits}`);
            console.log(`     - Write capacity: ${tableInfo.Table.ProvisionedThroughput.WriteCapacityUnits}`);
        }

        console.log('\n✅ All checks passed successfully!');
        console.log('\nYour AWS setup is working correctly and ready to use.');
        return true;

    } catch (error) {
        console.log('\n❌ Error during AWS checks:');
        console.log('Error:', error.message);
        
        if (error.code === 'ExpiredToken') {
            console.log('\n⚠️ Your session token has expired. Please get new credentials from AWS Academy.');
        } else if (error.code === 'UnauthorizedOperation') {
            console.log('\n⚠️ Your credentials don\'t have sufficient permissions.');
        } else if (error.code === 'CredentialsError') {
            console.log('\n⚠️ Invalid credentials. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
        }
        
        return false;
    }
}

// Run the checks
checkAWSCredentials()
    .then(success => {
        if (!success) {
            console.log('\n📋 Troubleshooting steps:');
            console.log('1. Verify your AWS Academy session is active');
            console.log('2. Get fresh credentials from AWS Academy');
            console.log('3. Update your .env file with the new credentials');
            console.log('4. Make sure to copy the entire session token without line breaks');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });