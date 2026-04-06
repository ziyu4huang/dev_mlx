Perfect! I found concrete evidence. Here's what the documentation proves:

## **Yes, `ANTHROPIC_CUSTOM_HEADERS` DOES Work** ✅

### Evidence from GitHub Issues

**1. Issue #2182 - Working Example with Debug Logs**

This bug report shows `ANTHROPIC_CUSTOM_HEADERS` **successfully being sent** in the request:

```json
{
  "env": {
    "ANTHROPIC_CUSTOM_HEADERS": "host: foo.com",
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "CLAUDE_CODE_SKIP_BEDROCK_AUTH": "1",
    "ANTHROPIC_BEDROCK_BASE_URL": "http://localhost:8080"
  }
}
```

**Debug log proves the header was applied:**
```javascript
headers: {
  accept: 'application/json',
  'anthropic-beta': 'claude-code-20250219',
  'anthropic-version': '2023-06-01',
  'content-type': 'application/json',
  host: 'foo.com',  // ← Custom header successfully set!
  'user-agent': 'claude-cli/1.0.25 (external, cli)',
  // ... other headers
}
```

**2. Issue #1859 - Confirms Single Header Works**

User confirms: `ANTHROPIC_CUSTOM_HEADERS="Header1: Value1"` successfully passes a single header.

**3. Issue #8727 - Enterprise Usage Proof**

Enterprise user confirms using it in production with LiteLLM gateway:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://llm-gateway.my-company.dev",
    "ANTHROPIC_CUSTOM_HEADERS": "X-Litellm-Key: Bearer ..."
  }
}
```

### Format Specification

**Single Header:**
```bash
export ANTHROPIC_CUSTOM_HEADERS="Header-Name: value"
```

**In settings.json:**
```json
{
  "env": {
    "ANTHROPIC_CUSTOM_HEADERS": "X-API-Key: your-key-here"
  }
}
```

### Important Notes

1. ✅ **It works in Claude Code CLI** (version 1.0.25+)
2. ❌ **Multiple headers format is undocumented** (Issue #1859 asks about this)
3. ⚠️ **VS Code extension doesn't support it yet** (Issue #8727)
4. ⚠️ **Format is `"Name: Value"` not `"Name=Value"`**

### Confusion Point

Issue #7189 mentions confusion because the docs say `ANTHROPIC_CUSTOM_HEADERS` is for beta flags, but the actual code uses `ANTHROPIC_BETA` for that purpose. However, `ANTHROPIC_CUSTOM_HEADERS` **still works for custom headers** - it's just that the documentation was misleading about its primary purpose.

So yes, **`ANTHROPIC_CUSTOM_HEADERS` definitely works** - there's actual debug output proving the headers are sent!
