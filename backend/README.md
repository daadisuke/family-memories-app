# Family Memories API - FastAPI Backend

AI-powered photo tagging API for the Family Memories App.

## Setup

### 1. Create virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env and add your GOOGLE_GEMINI_API_KEY
```

### 4. Run the server

```bash
# Development mode with auto-reload
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "gemini_available": true
}
```

### Generate Tags

```
POST /api/v1/photos/generate-tags
Content-Type: application/json

{
  "image_url": "https://example.com/photo.jpg"
}
```

Response:
```json
{
  "success": true,
  "tags": ["笑顔", "公園", "夏", "家族", "子供"],
  "message": "5個のタグを生成しました"
}
```

### Check Gemini Status

```
GET /api/v1/photos/gemini-status
```

Response:
```json
{
  "available": true
}
```

## API Documentation

Once the server is running, you can access:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
