// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskReward {
    address public owner;
    uint256 public totalTasks;
    uint256 public rewardAmount;
    
    struct Task {
        uint256 id;
        string description;
        address creator;
        bool completed;
        uint256 reward;
    }
    
    mapping(uint256 => Task) public tasks;
    
    event TaskCreated(uint256 indexed taskId, string description, uint256 reward);
    event TaskCompleted(uint256 indexed taskId, address indexed completer);
    event RewardClaimed(uint256 indexed taskId, address indexed claimer, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        rewardAmount = 0.001 ether;
    }
    
    // Write function: Create a new task
    function createTask(string memory _description) public payable {
        require(msg.value >= rewardAmount, "Must send minimum reward amount");
        
        totalTasks++;
        tasks[totalTasks] = Task({
            id: totalTasks,
            description: _description,
            creator: msg.sender,
            completed: false,
            reward: msg.value
        });
        
        emit TaskCreated(totalTasks, _description, msg.value);
    }
    
    // Write function: Complete a task and claim reward
    function completeTask(uint256 _taskId) public {
        require(_taskId > 0 && _taskId <= totalTasks, "Invalid task ID");
        require(!tasks[_taskId].completed, "Task already completed");
        require(msg.sender != tasks[_taskId].creator, "Creator cannot complete own task");
        
        tasks[_taskId].completed = true;
        
        uint256 reward = tasks[_taskId].reward;
        payable(msg.sender).transfer(reward);
        
        emit TaskCompleted(_taskId, msg.sender);
        emit RewardClaimed(_taskId, msg.sender, reward);
    }
    
    // Read function: Get task details
    function getTask(uint256 _taskId) public view returns (
        uint256 id,
        string memory description,
        address creator,
        bool completed,
        uint256 reward
    ) {
        require(_taskId > 0 && _taskId <= totalTasks, "Invalid task ID");
        Task memory task = tasks[_taskId];
        return (task.id, task.description, task.creator, task.completed, task.reward);
    }
    
    // Read function: Get contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Read function: Get total number of tasks
    function getTotalTasks() public view returns (uint256) {
        return totalTasks;
    }
}