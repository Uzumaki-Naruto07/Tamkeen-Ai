# Mock UAE PASS Server

This is a simple mock server that simulates the UAE PASS authentication flow for development and testing purposes.

## Setup

1. Install the requirements:
```
pip install -r requirements.txt
```

2. Run the server:
```
python server.py
```

Alternatively, you can use the provided launch script:
```
./run.sh
```

The server will run on `http://localhost:5005`

## Endpoints

### 1. Initiate UAE PASS Session
- **URL**: `/mock/uaepass/initiate`
- **Method**: `POST`
- **Response**: Returns a session ID and redirect URL for the UAE PASS authentication flow.

### 2. Validate UAE PASS Session
- **URL**: `/mock/uaepass/validate`
- **Method**: `POST`
- **Body**: 
```json
{
  "sessionId": "your-session-id"
}
```
- **Response**: Returns mock user data and a verification code.

### 3. Verify UAE PASS Code
- **URL**: `/mock/uaepass/verify`
- **Method**: `POST`
- **Body**: 
```json
{
  "sessionId": "your-session-id",
  "code": "123456"
}
```
- **Response**: Returns access and refresh tokens along with user information.

### 4. List All Sessions (Debug)
- **URL**: `/mock/uaepass/sessions`
- **Method**: `GET`
- **Response**: Returns all active UAE PASS sessions.

## Test User

The system comes with one pre-configured test user:
- Email: test@example.com
- Verification Code: 123456 