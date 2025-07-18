---
name: "\U0001F4E9 Support Request"
about: Contact us if Smart Email Assist fails or behaves unexpectedly
title: ''
labels: ''
assignees: ''

---

title: "[Support] "
labels: [support]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for using **Smart Email Assist**!  
        Please note:
        - Sometimes Gemini might be overloaded and may take **10–20 seconds** or **fail temporarily**.
        - If it still doesn't work, please submit the form below or contact us directly.
        - 📧 **vaishnavi.kk1709@gmail.com**
  - type: input
    id: email
    attributes:
      label: Your Email
      placeholder: name@example.com
    validations:
      required: true
  - type: textarea
    id: issue
    attributes:
      label: Describe the issue
      placeholder: Describe what’s not working or what happened
    validations:
      required: true
  - type: textarea
    id: screenshot
    attributes:
      label: Screenshots (optional)
      placeholder: Drag and drop any screenshots here
  - type: markdown
    attributes:
      value: |
        ⏳ We'll try to resolve your issue within **24–48 hours**.  
        Thank you for your patience!
