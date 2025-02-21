# API Documentation for Web3 Freelancer Platform

This document provides detailed information about the RESTful endpoints available for the Web3 Freelancer Platform. The API supports operations for tasks, submissions, and user profiles.

**Base URL:** `http://localhost:8081/`

---

## Table of Contents
- [Models](#models-documentation)
  - [Task](#task)
  - [Submission](#submission)
  - [User Profile](#userprofile)
- [Task Endpoints](#task-endpoints)
  - [Create Task](#create-task)
  - [Get Task by ID](#get-task-by-id)
  - [Update Task](#update-task)
  - [Delete Task](#delete-task)
  - [Cancel Task](#cancel-task)
  - [Mark Task as Completed](#mark-task-as-completed)
  - [List All Tasks](#list-all-tasks)
- [Submission Endpoints](#submission-endpoints)
  - [Create Submission](#create-submission)
  - [Get Submission by ID](#get-submission-by-id)
  - [Update Submission](#update-submission)
  - [Delete Submission](#delete-submission)
  - [Approve Submission](#approve-submission)
  - [List Submissions by Task ID](#list-submissions-by-task-id)
- [User Profile Endpoints](#user-profile-endpoints)
  - [Create User Profile](#create-user-profile)
  - [Get User Profile](#get-user-profile)
  - [Update User Profile](#update-user-profile)
  - [Delete User Profile](#delete-user-profile)
  - [List All User Profiles](#list-all-user-profiles)
  - [Update Reputation](#update-reputation)
  - [Add Earnings](#add-earnings)
  - [Add Spent](#add-spent)
- [AI Endpoints](#ai-endpoints)
  - [Send Prompt](#1-send-ai-prompt)
  - [Ask About a task](#2-send-task-specific-ai-prompt)

---

# Models Documentation

## **Task**
```kotlin

data class Task(
    @Id
    val id: Int = 1,
    val title: String,
    val description: String,
    val bounty: BigDecimal,
    val deadline: LocalDateTime,
    val providerId: String,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val category: String,
    val skills: List<String>,
    val attachments: List<String> = emptyList(),
    val isCompleted: Boolean = false,
    val isCancelled: Boolean = false
)
```

## **Submission**
```kotlin
data class Submission(
    @Id
    val subId:String = UUID.randomUUID().toString(),
    val taskId:Int,
    val freelancer: String,
    val submissionLink: String,
    val isApproved: Boolean = false,
    val review:String? = null
)
```

## **UserProfile**
```kotlin
data class UserProfile(
    @Id
    val walletAddress: String,  //wallet address
    val username: String,
    val bio: String? = null,  // Optional bio
    val resumeUrl:String? = null, // optional resume url
    val role: UserRole,  // TASK_PROVIDER or FREELANCER
    val reputationScore: Int = 0,  // Trust score based on performance
    val totalEarnings: BigDecimal = BigDecimal.ZERO,  // Earnings
    val totalSpent: BigDecimal = BigDecimal.ZERO,  // Amount spent by task providers
    val createdAt: LocalDateTime = LocalDateTime.now()  // Timestamp
)

enum class UserRole {
    TASK_PROVIDER, FREELANCER
}
```

## Task Endpoints

### Create Task
- **Endpoint:** `POST /tasks`
- **Description:** Create a new task.
- **Request Body:**
  ```json
  {
    "id": 1,
    "title": "Design a Logo",
    "description": "Design a logo for our new product.",
    "bounty": 0.3,
    "deadline": "2025-03-01T12:00:00",
    "providerId": "0xProviderWallet",
    "createdAt": "2025-02-18T10:00:00",
    "category": "Design",
    "skills": ["Photoshop", "Illustrator"],
    "attachments": [],
    "isCompleted": false,
    "isCancelled": false
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Design a Logo",
    "description": "Design a logo for our new product.",
    "bounty": 0.3,
    "deadline": "2025-03-01T12:00:00",
    "providerId": "0xProviderWallet",
    "createdAt": "2025-02-18T10:00:00",
    "category": "Design",
    "skills": ["Photoshop", "Illustrator"],
    "attachments": [],
    "isCompleted": false,
    "isCancelled": false
  }
  ```

### Get Task by ID
- **Endpoint:** `GET /tasks/{id}`
- **Description:** Retrieve details of a specific task by its ID.
- **Path Parameter:**
    - `id` (integer): The unique ID of the task.
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Design a Logo",
    "description": "Design a logo for our new product.",
    "bounty": 500,
    "deadline": "2025-03-01T12:00:00",
    "providerId": "0xProviderWallet",
    "createdAt": "2025-02-18T10:00:00",
    "category": "Design",
    "skills": ["Photoshop", "Illustrator"],
    "attachments": [],
    "isCompleted": false,
    "isCancelled": false
  }
  ```

### Update Task
- **Endpoint:** `PUT /tasks/{id}`
- **Description:** Update an existing task. The task ID in the request body must match the path variable.
- **Path Parameter:**
    - `id` (integer): The unique ID of the task.
- **Request Body:**
  ```json
  {
    "id": 1,
    "title": "Design a Logo (Updated)",
    "description": "Design an updated logo for our new product.",
    "bounty": 600,
    "deadline": "2025-03-05T12:00:00",
    "providerId": "0xProviderWallet",
    "createdAt": "2025-02-18T10:00:00",
    "category": "Design",
    "skills": ["Photoshop", "Illustrator", "Figma"],
    "attachments": [],
    "isCompleted": false,
    "isCancelled": false
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Design a Logo (Updated)",
    "description": "Design an updated logo for our new product.",
    "bounty": 600,
    "deadline": "2025-03-05T12:00:00",
    "providerId": "0xProviderWallet",
    "createdAt": "2025-02-18T10:00:00",
    "category": "Design",
    "skills": ["Photoshop", "Illustrator", "Figma"],
    "attachments": [],
    "isCompleted": false,
    "isCancelled": false
  }
  ```

### Delete Task
- **Endpoint:** `DELETE /tasks/{id}`
- **Description:** Delete a task by its ID.
- **Path Parameter:**
    - `id` (integer): The unique ID of the task.
- **Response:** HTTP 204 No Content

### Cancel Task
- **Endpoint:** `POST /tasks/{id}/cancel`
- **Description:** Mark a task as cancelled.
- **Path Parameter:**
    - `id` (integer): The unique ID of the task.
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Design a Logo",
    "description": "Design a logo for our new product.",
    "bounty": 500,
    "deadline": "2025-03-01T12:00:00",
    "providerId": "0xProviderWallet",
    "createdAt": "2025-02-18T10:00:00",
    "category": "Design",
    "skills": ["Photoshop", "Illustrator"],
    "attachments": [],
    "isCompleted": false,
    "isCancelled": true
  }
  ```

### Mark Task as Completed
- **Endpoint:** `POST /tasks/{id}/complete`
- **Description:** Mark a task as completed.
- **Path Parameter:**
    - `id` (integer): The unique ID of the task.
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Design a Logo",
    "description": "Design a logo for our new product.",
    "bounty": 500,
    "deadline": "2025-03-01T12:00:00",
    "providerId": "0xProviderWallet",
    "createdAt": "2025-02-18T10:00:00",
    "category": "Design",
    "skills": ["Photoshop", "Illustrator"],
    "attachments": [],
    "isCompleted": true,
    "isCancelled": false
  }
  ```

### List All Tasks
- **Endpoint:** `GET /tasks`
- **Description:** Retrieve a list of all tasks.
- **Response:**
  ```json
  [
    {
      "id": 1,
      "title": "Design a Logo",
      "description": "Design a logo for our new product.",
      "bounty": 500,
      "deadline": "2025-03-01T12:00:00",
      "providerId": "0xProviderWallet",
      "createdAt": "2025-02-18T10:00:00",
      "category": "Design",
      "skills": ["Photoshop", "Illustrator"],
      "attachments": [],
      "isCompleted": false,
      "isCancelled": false
    }
  ]
  ```

---

## Submission Endpoints

### Create Submission
- **Endpoint:** `POST /submissions`
- **Description:** Create a new submission for a task.
- **Request Body:**
  ```json
  {
    "subId": "generated-uuid",
    "taskId": 1,
    "freelancer": "0xFreelancerWallet",
    "submissionLink": "https://link-to-submission.com",
    "isApproved": false,
    "review": ""
  }
  ```
- **Response:**
  ```json
  {
    "subId": "generated-uuid",
    "taskId": 1,
    "freelancer": "0xFreelancerWallet",
    "submissionLink": "https://link-to-submission.com",
    "isApproved": false,
    "review": ""
  }
  ```

### Get Submission by ID
- **Endpoint:** `GET /submissions/{id}`
- **Description:** Retrieve a submission by its unique ID.
- **Path Parameter:**
    - `id` (string): The unique ID of the submission.
- **Response:**
  ```json
  {
    "subId": "generated-uuid",
    "taskId": 1,
    "freelancer": "0xFreelancerWallet",
    "submissionLink": "https://link-to-submission.com",
    "isApproved": false,
    "review": ""
  }
  ```

### Update Submission
- **Endpoint:** `PUT /submissions/{id}`
- **Description:** Update an existing submission. The submission ID in the request body must match the path variable.
- **Path Parameter:**
    - `id` (string): The unique ID of the submission.
- **Request Body:**
  ```json
  {
    "subId": "generated-uuid",
    "taskId": 1,
    "freelancer": "0xFreelancerWallet",
    "submissionLink": "https://updated-link-to-submission.com",
    "isApproved": false,
    "review": "Updated review comments"
  }
  ```
- **Response:**
  ```json
  {
    "subId": "generated-uuid",
    "taskId": 1,
    "freelancer": "0xFreelancerWallet",
    "submissionLink": "https://updated-link-to-submission.com",
    "isApproved": false,
    "review": "Updated review comments"
  }
  ```

### Delete Submission
- **Endpoint:** `DELETE /submissions/{id}`
- **Description:** Delete a submission by its unique ID.
- **Path Parameter:**
    - `id` (string): The unique ID of the submission.
- **Response:** HTTP 204 No Content

### Approve Submission
- **Endpoint:** `POST /submissions/{id}/approve`
- **Description:** Mark a submission as approved.
- **Path Parameter:**
    - `id` (string): The unique ID of the submission.
- **Response:**
  ```json
  {
    "subId": "generated-uuid",
    "taskId": 1,
    "freelancer": "0xFreelancerWallet",
    "submissionLink": "https://link-to-submission.com",
    "isApproved": true,
    "review": ""
  }
  ```

### List Submissions by Task ID
- **Endpoint:** `GET /submissions/task/{taskId}`
- **Description:** Retrieve all submissions associated with a specific task.
- **Path Parameter:**
    - `taskId` (integer): The ID of the task.
- **Response:**
  ```json
  [
    {
      "subId": "generated-uuid",
      "taskId": 1,
      "freelancer": "0xFreelancerWallet",
      "submissionLink": "https://link-to-submission.com",
      "isApproved": false,
      "review": ""
    }
  ]
  ```

---

## User Profile Endpoints

### Create User Profile
- **Endpoint:** `POST /users`
- **Description:** Create a new user profile.
- **Request Body:**
  ```json
  {
    "walletAddress": "0xUserWallet",
    "username": "john_doe",
    "bio": "Experienced developer",
    "resumeUrl": "https://link-to-resume.com",
    "role": "FREELANCER",
    "reputationScore": 10,
    "totalEarnings": "1500.00",
    "totalSpent": "300.00",
    "createdAt": "2025-02-18T10:00:00"
  }
  ```
- **Response:**
  ```json
  {
    "walletAddress": "0xUserWallet",
    "username": "john_doe",
    "bio": "Experienced developer",
    "resumeUrl": "https://link-to-resume.com",
    "role": "FREELANCER",
    "reputationScore": 10,
    "totalEarnings": "1500.00",
    "totalSpent": "300.00",
    "createdAt": "2025-02-18T10:00:00"
  }
  ```

### Get User Profile
- **Endpoint:** `GET /users/{walletAddress}`
- **Description:** Retrieve a user profile by the wallet address.
- **Path Parameter:**
    - `walletAddress` (string): The user's wallet address.
- **Response:**
  ```json
  {
    "walletAddress": "0xUserWallet",
    "username": "john_doe",
    "bio": "Experienced developer",
    "resumeUrl": "https://link-to-resume.com",
    "role": "FREELANCER",
    "reputationScore": 10,
    "totalEarnings": "1500.00",
    "totalSpent": "300.00",
    "createdAt": "2025-02-18T10:00:00"
  }
  ```

### Update User Profile
- **Endpoint:** `PUT /users/{walletAddress}`
- **Description:** Update an existing user profile. The wallet address in the request body must match the path variable.
- **Path Parameter:**
    - `walletAddress` (string): The user's wallet address.
- **Request Body:**
  ```json
  {
    "walletAddress": "0xUserWallet",
    "username": "john_doe_updated",
    "bio": "Senior developer with extensive experience",
    "resumeUrl": "https://link-to-updated-resume.com",
    "role": "FREELANCER",
    "reputationScore": 15,
    "totalEarnings": "2000.00",
    "totalSpent": "300.00",
    "createdAt": "2025-02-18T10:00:00"
  }
  ```
- **Response:**
  ```json
  {
    "walletAddress": "0xUserWallet",
    "username": "john_doe_updated",
    "bio": "Senior developer with extensive experience",
    "resumeUrl": "https://link-to-updated-resume.com",
    "role": "FREELANCER",
    "reputationScore": 15,
    "totalEarnings": "2000.00",
    "totalSpent": "300.00",
    "createdAt": "2025-02-18T10:00:00"
  }
  ```

### Delete User Profile
- **Endpoint:** `DELETE /users/{walletAddress}`
- **Description:** Delete a user profile by wallet address.
- **Path Parameter:**
    - `walletAddress` (string): The user's wallet address.
- **Response:** HTTP 204 No Content

### List All User Profiles
- **Endpoint:** `GET /users`
- **Description:** Retrieve a list of all user profiles.
- **Response:**
  ```json
  [
    {
      "walletAddress": "0xUserWallet",
      "username": "john_doe",
      "bio": "Experienced developer",
      "resumeUrl": "https://link-to-resume.com",
      "role": "FREELANCER",
      "reputationScore": 10,
      "totalEarnings": "1500.00",
      "totalSpent": "300.00",
      "createdAt": "2025-02-18T10:00:00"
    }
  ]
  ```

### Update Reputation
- **Endpoint:** `POST /users/{walletAddress}/reputation`
- **Description:** Update the reputation score of a user by adding a delta value.
- **Path Parameter:**
    - `walletAddress` (string): The user's wallet address.
- **Query Parameter:**
    - `delta` (integer): The value to add to the user's current reputation score.
- **Response:**
  ```json
  {
    "walletAddress": "0xUserWallet",
    "username": "john_doe",
    "bio": "Experienced developer",
    "resumeUrl": "https://link-to-resume.com",
    "role": "FREELANCER",
    "reputationScore": 12,
    "totalEarnings": "1500.00",
    "totalSpent": "300.00",
    "createdAt": "2025-02-18T10:00:00"
  }
  ```

### Add Earnings
- **Endpoint:** `POST /users/{walletAddress}/earnings`
- **Description:** Add earnings to the user's total earnings.
- **Path Parameter:**
    - `walletAddress` (string): The user's wallet address.
- **Query Parameter:**
    - `earnings` (decimal): The amount to add to the user's total earnings.
- **Response:**
  ```json
  {
    "walletAddress": "0xUserWallet",
    "username": "john_doe",
    "bio": "Experienced developer",
    "resumeUrl": "https://link-to-resume.com",
    "role": "FREELANCER",
    "reputationScore": 10,
    "totalEarnings": "1700.00",
    "totalSpent": "300.00",
    "createdAt": "2025-02-18T10:00:00"
  }
  ```

### Add Spent
- **Endpoint:** `POST /users/{walletAddress}/spent`
- **Description:** Add an amount to the user's total spent.
- **Path Parameter:**
    - `walletAddress` (string): The user's wallet address.
- **Query Parameter:**
    - `spent` (decimal): The amount to add to the user's total spent.
- **Response:**
  ```json
  {
    "walletAddress": "0xUserWallet",
    "username": "john_doe",
    "bio": "Experienced developer",
    "resumeUrl": "https://link-to-resume.com",
    "role": "FREELANCER",
    "reputationScore": 10,
    "totalEarnings": "1500.00",
    "totalSpent": "500.00",
    "createdAt": "2025-02-18T10:00:00"
  }
  ```

## AI Endpoints

### 1. Send AI Prompt
#### **POST** `/api/ai`

This endpoint sends a prompt to the AI provider and returns the AI-generated response.

#### **Request Body**
```json
{
  "prompt": "Explain blockchain in simple terms."
}
```

#### **Response**
```json
"Blockchain is a decentralized ledger technology that enables secure and transparent transactions..."
```

---

### 2. Send Task-Specific AI Prompt
#### **POST** `/api/ai/{id}`

This endpoint sends a task-specific prompt to the AI provider. The AI receives additional task details and generates a response accordingly.

#### **Path Parameter**
- `id` (Integer): The unique identifier of the task.

#### **Request Body**
```json
{
  "prompt": "Summarize the task."
}
```

#### **Response**
```json
"Task ID: 5, Title: Smart Contract Audit, Description: Audit the provided Solidity smart contract..."
```

---

## Final Notes
- All date-time fields are expected to follow the [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
- When updating resources, ensure that the IDs provided in the URL and request body match.
- **HTTP Status Codes:**
    - `200 OK` for successful GET, POST, and PUT operations.
    - `204 No Content` for successful DELETE operations.
    - `400 Bad Request` if the request is malformed.
    - `404 Not Found` if the resource cannot be found.

---

