console.log("Email Writer Extension - Content Script Loaded");

let selectedTone = "professional";

function createSplitAIButton() {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'inline-flex';
  wrapper.style.position = 'relative';
  wrapper.style.marginRight = '8px';
  wrapper.style.zIndex = 10000;

  // Main AI Reply button with Gmail styling classes
  const mainButton = document.createElement('div');
  mainButton.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
  mainButton.innerText = 'AI Reply';
  mainButton.setAttribute('role', 'button');
  mainButton.setAttribute('data-tooltip', 'Generate AI Reply');
  mainButton.style.userSelect = 'none';
  mainButton.style.flex = 'none';

  // Dropdown toggle button (vertical dots)
  const dropdownToggle = document.createElement('div');
  dropdownToggle.innerHTML = '&#8942;';
  Object.assign(dropdownToggle.style, {
    backgroundColor: '#1565c0',
    color: 'white',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    flex: 'none',
    borderRadius: '0 4px 4px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  });

  // Dropdown menu container
  const dropdownMenu = document.createElement('ul');
  Object.assign(dropdownMenu.style, {
    display: 'none',
    position: 'fixed',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    listStyle: 'none',
    margin: '4px 0 0',
    padding: '0',
    zIndex: 100000,
    minWidth: '120px',
    maxHeight: '150px',
    overflowY: 'auto',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    borderRadius: '4px',
     fontSize: '12px'
  });

  const tones = ['Professional', 'Friendly', 'Casual', 'Assertive', 'Empathetic'];
  tones.forEach(tone => {
    const li = document.createElement('li');
    li.innerText = tone;
    Object.assign(li.style, {
      padding: '8px 12px',
      cursor: 'pointer',
       fontSize: '12px',
    });

    li.addEventListener('mouseenter', () => li.style.backgroundColor = '#f1f1f1');
    li.addEventListener('mouseleave', () => li.style.backgroundColor = '');
    li.addEventListener('click', () => {
      selectedTone = tone.toLowerCase();
      hideDropdown();
    });

    dropdownMenu.appendChild(li);
  });

  function showDropdown() {
    const rect = dropdownToggle.getBoundingClientRect();
    const dropdownHeight = 200; // match maxHeight

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
      dropdownMenu.style.top = (rect.top - dropdownHeight) + 'px';
    } else {
      dropdownMenu.style.top = rect.bottom + 'px';
    }
    dropdownMenu.style.left = rect.left + 'px';
    dropdownMenu.style.display = 'block';

    if (!dropdownMenu.parentNode) {
      document.body.appendChild(dropdownMenu);
    }
  }

  function hideDropdown() {
    dropdownMenu.style.display = 'none';
    if (dropdownMenu.parentNode) {
      dropdownMenu.parentNode.removeChild(dropdownMenu);
    }
  }

  dropdownToggle.addEventListener('click', e => {
    e.stopPropagation();
    if (dropdownMenu.style.display === 'block') {
      hideDropdown();
    } else {
      showDropdown();
    }
  });

  document.addEventListener('click', () => {
    if (dropdownMenu.style.display === 'block') {
      hideDropdown();
    }
  });

  mainButton.addEventListener('click', async () => {
    mainButton.innerText = 'Generating...';
    mainButton.style.pointerEvents = 'none';

    const emailContent = getEmailContent();

    try {
      const response = await fetch('http://localhost:8080/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContent, tone: selectedTone }),
      });

      if (!response.ok) throw new Error('API Request Failed');

      const generatedReply = await response.text();

      const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
      if (composeBox) {
        composeBox.focus();
        document.execCommand('insertText', false, generatedReply);
      } else {
        console.error('Compose box not found');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate reply');
    } finally {
      mainButton.innerText = 'AI Reply';
      mainButton.style.pointerEvents = 'auto';
    }
  });

  wrapper.appendChild(mainButton);
  wrapper.appendChild(dropdownToggle);

  return wrapper;
}

function getEmailContent() {
  const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el.innerText.trim();
  }
  return '';
}

function findComposeToolbar() {
  const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function injectButton() {
  const existing = document.querySelector('.ai-reply-split-button');
  if (existing) existing.remove();

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  const button = createSplitAIButton();
  button.classList.add('ai-reply-split-button');
  toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    const added = Array.from(mutation.addedNodes);
    if (added.some(node =>
      node.nodeType === 1 &&
      (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
    )) {
      console.log("Compose window detected");
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
