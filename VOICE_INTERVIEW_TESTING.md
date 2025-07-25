# Voice Interview Testing Guide

## 🎤 New Voice Interview Functionality

The Voice Agent button now requests voice screening interviews instead of making Twilio calls. Here's how to test and debug the new functionality:

## 🔗 Direct Interview Links

### Generating Links
```javascript
// In browser console or development mode
const screeningResultId = "your-screening-result-id";

// Generate regular interview link
const regularLink = VoiceInterviewService.generateInterviewLink(screeningResultId);
console.log(regularLink);
// Output: https://yourdomain.com/interview/screening-result-id

// Generate auto-start interview link
const autoStartLink = VoiceInterviewService.generateInterviewLink(screeningResultId, true);
console.log(autoStartLink);
// Output: https://yourdomain.com/interview/screening-result-id?autostart=true

// Copy link to clipboard
VoiceInterviewService.copyInterviewLink(screeningResultId, true);
```

### Link Types
1. **Regular Link**: `/interview/:screeningResultId`
   - Candidate clicks "Start Interview" button
   - Manual control over when interview begins

2. **Auto-start Link**: `/interview/:screeningResultId?autostart=true`
   - Interview starts automatically when page loads
   - Perfect for email links from n8n workflow

## 🔍 Debugging Dynamic Variables

### Browser Console Debugging
```javascript
// Check current state
voiceInterviewService.logCurrentState();

// View last passed variables
console.log(window.lastInterviewVariables);

// View last interview data
console.log(window.lastInterviewData);

// Check if variables are being passed correctly
window.lastInterviewVariables = {
  user_name: "John Doe",
  job_title: "Software Engineer", 
  job_requirements: "5+ years experience...",
  job_description: "We are looking for...",
  candidate_resume: "Resume text content..."
}
```

### Development Mode Features
In development mode, you'll see:
- **Purple "Copy Link" button** next to Voice Agent button
- **Debug information panel** on interview page showing:
  - Screening Result ID
  - Auto-start status
  - Current URL
  - Interview data loaded status
  - Dynamic variables preview

### Console Logging
When starting an interview, look for these console logs:
```
🎤 Starting ElevenLabs Voice Interview
  Agent ID: agent_01jzg15d26fnqawdzq75wyn187
  Screening Result ID: uuid-here
  Dynamic Variables Being Passed: [table view]

✅ Connected to ElevenLabs agent
🔍 To debug variables, use: window.lastInterviewVariables
```

## 🧪 Testing Workflow

### 1. Test Voice Screening Request
1. Go to `/screening-results`
2. Click "Voice Agent" button on any result
3. Verify `voice_screening_requested` is set to `true` in database
4. Button should show "Interview Requested" and be disabled

### 2. Test Direct Interview Link
1. In development mode, click purple "Copy Link" button
2. Open copied link in new tab/window
3. Interview should auto-start (if autostart=true)
4. Check console for variable logging

### 3. Test Manual Interview Start
1. Visit `/interview/:screeningResultId` (without autostart param)
2. Click "Start Interview" button
3. Grant microphone permissions
4. Verify connection to ElevenLabs agent

### 4. Debug Variables
1. Open browser console during interview
2. Use `window.lastInterviewVariables` to inspect passed data
3. Verify all required variables are present:
   - `user_name`
   - `job_title` 
   - `job_requirements`
   - `job_description`
   - `candidate_resume`

## 📋 n8n Integration

### Email Template
Your n8n workflow should generate links like:
```
https://yourdomain.com/interview/{{screening_result_id}}?autostart=true
```

### Database Monitoring
n8n should:
1. Monitor `screening_results.voice_screening_requested = true`
2. Send email with interview link
3. Set `voice_screening_requested = false` after sending
4. Later populate `interview_summary` after interview completion

## 🔧 Environment Variables Required
```
VITE_AGENT_ID=agent_01jzg15d26fnqawdzq75wyn187
VITE_ELEVENLABS_KEY=sk_3f818c9527ef5ef3df50e7b503dea78c67fc9a5f25cc763f
```

## 🚨 Troubleshooting

### Variables Not Passing
- Check console logs for variable table
- Verify `window.lastInterviewVariables` contains expected data
- Ensure database has resume_text data in applications table

### Interview Won't Start
- Check microphone permissions
- Verify ElevenLabs API key is valid
- Check agent ID is correct
- Look for error messages in console

### Database Issues
- Ensure `voice_screening_requested` column exists
- Verify `interview_summary` and `interview_completed_at` columns exist
- Check applications table has `resume_text` column 