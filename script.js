// Contract Configuration
const CONTRACT_ADDRESS = "0x5824Dd02F3fAac2010C5574765202DeC19E52CFE"; // REPLACE THIS!
const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "completer", "type": "address"}
        ],
        "name": "TaskCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256"},
            {"indexed": false, "internalType": "string", "name": "description", "type": "string"},
            {"indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256"}
        ],
        "name": "TaskCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "claimer", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "RewardClaimed",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_taskId", "type": "uint256"}],
        "name": "completeTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_description", "type": "string"}],
        "name": "createTask",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_taskId", "type": "uint256"}],
        "name": "getTask",
        "outputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "address", "name": "creator", "type": "address"},
            {"internalType": "bool", "name": "completed", "type": "bool"},
            {"internalType": "uint256", "name": "reward", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalTasks",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardAmount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "tasks",
        "outputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "address", "name": "creator", "type": "address"},
            {"internalType": "bool", "name": "completed", "type": "bool"},
            {"internalType": "uint256", "name": "reward", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalTasks",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Global variables
let provider;
let signer;
let contract;
let userAccount;

// Display contract address on page load
document.getElementById('contractAddressDisplay').textContent = CONTRACT_ADDRESS;

// Connect Wallet Function
document.getElementById('connectButton').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            
            // Setup ethers provider and signer
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            // Display connected account
            document.getElementById('accountDisplay').textContent = 
                `✅ Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
            
            // Get and display network
            const network = await provider.getNetwork();
            document.getElementById('networkDisplay').textContent = 
                `🌐 Network: ${network.name} (Chain ID: ${network.chainId})`;
            
            // Change button text
            document.getElementById('connectButton').textContent = '✓ Connected';
            document.getElementById('connectButton').disabled = true;
            
            // Load contract data
            await loadContractData();
            
        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect wallet. Make sure MetaMask is installed and unlocked.');
        }
    } else {
        alert('MetaMask is not installed. Please install it from https://metamask.io/');
    }
});

// Load Contract Data Function
async function loadContractData() {
    try {
        const totalTasks = await contract.getTotalTasks();
        const balance = await contract.getContractBalance();
        
        document.getElementById('totalTasks').textContent = totalTasks.toString();
        document.getElementById('contractBalance').textContent = 
            ethers.utils.formatEther(balance);
    } catch (error) {
        console.error('Error loading contract data:', error);
    }
}

// Refresh Button
document.getElementById('refreshButton').addEventListener('click', async () => {
    if (!contract) {
        alert('Please connect your wallet first!');
        return;
    }
    await loadContractData();
    showStatus('createTaskStatus', 'Data refreshed successfully!', 'success');
});

// Create Task Function
document.getElementById('createTaskButton').addEventListener('click', async () => {
    if (!contract) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const description = document.getElementById('taskDescription').value;
    const rewardAmount = document.getElementById('rewardInput').value;
    
    if (!description || !rewardAmount) {
        showStatus('createTaskStatus', 'Please fill all fields!', 'error');
        return;
    }
    
    if (parseFloat(rewardAmount) < 0.001) {
        showStatus('createTaskStatus', 'Minimum reward is 0.001 ETH!', 'error');
        return;
    }
    
    try {
        showStatus('createTaskStatus', 'Creating task... Please wait and confirm in MetaMask', 'info');
        
        const tx = await contract.createTask(description, {
            value: ethers.utils.parseEther(rewardAmount)
        });
        
        showStatus('createTaskStatus', 'Transaction submitted! Waiting for confirmation...', 'info');
        await tx.wait();
        
        showStatus('createTaskStatus', 
            `✅ Task created successfully! Transaction: ${tx.hash.substring(0, 10)}...`, 
            'success');
        
        // Clear inputs
        document.getElementById('taskDescription').value = '';
        document.getElementById('rewardInput').value = '0.001';
        
        // Reload contract data
        await loadContractData();
        
    } catch (error) {
        console.error('Error creating task:', error);
        showStatus('createTaskStatus', 
            `❌ Error: ${error.message || 'Transaction failed'}`, 
            'error');
    }
});

// View Task Function
document.getElementById('viewTaskButton').addEventListener('click', async () => {
    if (!contract) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const taskId = document.getElementById('taskIdView').value;
    
    if (!taskId) {
        alert('Please enter a task ID!');
        return;
    }
    
    try {
        const task = await contract.getTask(taskId);
        
        const taskDetailsDiv = document.getElementById('taskDetails');
        taskDetailsDiv.innerHTML = `
            <p><strong>Task ID:</strong> ${task.id.toString()}</p>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Creator:</strong> ${task.creator.substring(0, 10)}...${task.creator.substring(38)}</p>
            <p><strong>Status:</strong> ${task.completed ? '✅ Completed' : '⏳ Available'}</p>
            <p><strong>Reward:</strong> ${ethers.utils.formatEther(task.reward)} ETH</p>
        `;
        taskDetailsDiv.classList.add('show');
        
    } catch (error) {
        console.error('Error fetching task:', error);
        alert('Error: Task not found or invalid ID');
    }
});

// Complete Task Function
document.getElementById('completeTaskButton').addEventListener('click', async () => {
    if (!contract) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const taskId = document.getElementById('taskIdComplete').value;
    
    if (!taskId) {
        showStatus('completeTaskStatus', 'Please enter a task ID!', 'error');
        return;
    }
    
    try {
        showStatus('completeTaskStatus', 'Completing task... Please confirm in MetaMask', 'info');
        
        const tx = await contract.completeTask(taskId);
        
        showStatus('completeTaskStatus', 'Transaction submitted! Waiting for confirmation...', 'info');
        await tx.wait();
        
        showStatus('completeTaskStatus', 
            `✅ Task completed! Reward claimed! TX: ${tx.hash.substring(0, 10)}...`, 
            'success');
        
        // Clear input
        document.getElementById('taskIdComplete').value = '';
        
        // Reload contract data
        await loadContractData();
        
    } catch (error) {
        console.error('Error completing task:', error);
        showStatus('completeTaskStatus', 
            `❌ Error: ${error.message || 'Transaction failed'}`, 
            'error');
    }
});

// Helper function to show status messages
function showStatus(elementId, message, type) {
    const statusElement = document.getElementById(elementId);
    statusElement.textContent = message;
    statusElement.className = `status-message ${type} show`;
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            statusElement.classList.remove('show');
        }, 5000);
    }
}

// Listen for account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            location.reload();
        } else {
            userAccount = accounts[0];
            document.getElementById('accountDisplay').textContent = 
                `✅ Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
}