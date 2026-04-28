# Security Policy

## 🛡️ Commitment to Security
At **ResAgent**, we take the security of our multi-agent orchestration engine and user data seriously. This policy outlines our supported versions and the process for reporting security vulnerabilities.

## 📦 Supported Versions
We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## 🚨 Reporting a Vulnerability
If you discover a potential security vulnerability in this project, please **do not open a public issue**. Instead, follow the process below:

1.  **Direct Contact:** Send an email to [girishlade@ladestack.in](mailto:girishlade@ladestack.in) with the subject line `SECURITY VULNERABILITY - [Short Description]`.
2.  **Details Required:** Include a detailed description of the vulnerability, steps to reproduce, and the potential impact.
3.  **Response Timeline:** You can expect an initial acknowledgment within **48 hours**. We will provide regular updates every **3-5 days** until the issue is resolved.
4.  **Disclosure:** We follow a responsible disclosure policy. We ask that you give us reasonable time to fix the issue before making any information public.

## 🔑 API Security & Key Management
ResAgent relies on external AI providers (NVIDIA NIM, OpenRouter, Perplexity). To maintain a secure environment:

*   **Environment Variables:** Never hardcode API keys. Always use `.env.local` or secure CI/CD secrets.
*   **Leak Prevention:** The `.gitignore` file is configured to exclude environment files. If you accidentally commit a key, **revoke it immediately**.
*   **Secret Masking:** Our logs and SSE streams are designed to never leak raw API keys or sensitive user credentials.

## 🔒 Data Privacy
*   **Local Processing:** Document parsing (PDF, DOCX, OCR) is performed locally or via WebAssembly (WASM) where possible to minimize data transit.
*   **No Persistence:** By default, ResAgent does not store your uploaded documents or search history unless you have explicitly configured a persistent database (Supabase/Redis).

## 🛠️ Security Best Practices for Developers
*   Keep dependencies updated via `npm update`.
*   Run `npm audit` regularly to identify and patch vulnerable packages.
*   Ensure that all input is sanitized before being passed to LLM prompts to prevent prompt injection attacks.

---

### **Maintainer**
**Girish Lade**  
*UI/UX Developer & AI Systems Engineer*  
[LinkedIn](https://www.linkedin.com/in/girish-lade-075bba201/) | [Website](https://ladestack.in)
