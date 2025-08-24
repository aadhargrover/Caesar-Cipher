/* app.js — Cipher Tools + Animations */
document.addEventListener("DOMContentLoaded", () => {
  // ===== TAB SWITCHING =====
  const tabs = document.querySelectorAll(".tool-tabs button");
  const panels = document.querySelectorAll(".tool-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");

      panels.forEach(p => {
        p.hidden = true;
        p.classList.remove("active");
      });

      const panel = document.getElementById(`panel-${tab.dataset.tool}`);
      panel.hidden = false;
      panel.classList.add("active");
    });
  });

  // ===== HELPER FUNCTIONS =====
  const isLetter = (c) => /[a-zA-Z]/.test(c);

  const caesarCipher = (text, key, encrypt = true) => {
    return text.split("").map(c => {
      if (!isLetter(c)) return c;
      const base = c === c.toUpperCase() ? 65 : 97;
      const shift = encrypt ? key : -key;
      return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
    }).join("");
  };

  const rot13 = (text) => caesarCipher(text, 13);
  
  const atbashCipher = (text) => {
    return text.split("").map(c => {
      if (!isLetter(c)) return c;
      const base = c === c.toUpperCase() ? 65 : 97;
      return String.fromCharCode(base + (25 - (c.charCodeAt(0) - base)));
    }).join("");
  };

  const vigenereCipher = (text, key, encrypt = true) => {
    key = key.toUpperCase().replace(/[^A-Z]/g, "");
    if (!key) return text;
    let j = 0;
    return text.split("").map(c => {
      if (!isLetter(c)) return c;
      const base = c === c.toUpperCase() ? 65 : 97;
      const k = key[j % key.length].charCodeAt(0) - 65;
      const shift = encrypt ? k : -k;
      j++;
      return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
    }).join("");
  };

  // ===== PIGPEN CIPHER =====
  const pigpenMap = {
    A: "⛝", B: "⛞", C: "⛟", D: "⛠", E: "⛡", F: "⛢", G: "⛣", H: "⛤",
    I: "⛥", J: "⛦", K: "⛧", L: "⛨", M: "⛩", N: "⛪", O: "⛫", P: "⛬",
    Q: "⛭", R: "⛮", S: "⛯", T: "⛰", U: "⛱", V: "⛲", W: "⛳", X: "⛴",
    Y: "⛵", Z: "⛶"
  };
  const pigpenEncode = (text) => text.toUpperCase().split("").map(c => pigpenMap[c] || c).join("");
  const pigpenDecode = (text) => text.split("").map(c => {
    const entry = Object.entries(pigpenMap).find(([k,v]) => v === c);
    return entry ? entry[0] : c;
  }).join("");

  // ===== PLAYFAIR CIPHER =====
  const playfairCipher = (text, key, encrypt = true) => {
    key = key.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g,"I");
    text = text.toUpperCase().replace(/[^A-Z]/g,"").replace(/J/g,"I");

    // Create 5x5 matrix
    let matrix = [];
    let seen = new Set();
    key.split("").forEach(c => { if(!seen.has(c)){matrix.push(c); seen.add(c);} });
    for(let i=65;i<=90;i++){ 
      const c = String.fromCharCode(i);
      if(c === 'J') continue;
      if(!seen.has(c)){matrix.push(c); seen.add(c);}
    }

    const indexMap = {};
    matrix.forEach((c,i) => { indexMap[c] = [Math.floor(i/5), i%5]; });

    const digraphs = [];
    let i = 0;
    while(i<text.length){
      let a = text[i];
      let b = text[i+1] || 'X';
      if(a===b){ b='X'; i++; } else { i+=2; }
      digraphs.push([a,b]);
    }

    const result = digraphs.map(([a,b])=>{
      const [r1,c1] = indexMap[a];
      const [r2,c2] = indexMap[b];
      if(r1===r2){
        return matrix[r1*5 + (encrypt?(c1+1)%5:(c1+4)%5)] + matrix[r2*5 + (encrypt?(c2+1)%5:(c2+4)%5)];
      } else if(c1===c2){
        return matrix[((encrypt?(r1+1): (r1+4))%5)*5 + c1] + matrix[((encrypt?(r2+1): (r2+4))%5)*5 + c2];
      } else {
        return matrix[r1*5 + c2] + matrix[r2*5 + c1];
      }
    }).join("");

    return result;
  };

  // ===== BUTTON EVENT LISTENERS =====
  // Caesar
  document.getElementById("caesar-encrypt").addEventListener("click", () => {
    const text = document.getElementById("caesar-input").value;
    const key = parseInt(document.getElementById("caesar-key").value) || 0;
    document.getElementById("caesar-result").textContent = caesarCipher(text,key,true);
  });
  document.getElementById("caesar-decrypt").addEventListener("click", () => {
    const text = document.getElementById("caesar-input").value;
    const key = parseInt(document.getElementById("caesar-key").value) || 0;
    document.getElementById("caesar-result").textContent = caesarCipher(text,key,false);
  });
  document.getElementById("caesar-reset").addEventListener("click", () => {
    document.getElementById("caesar-input").value="";
    document.getElementById("caesar-key").value="";
    document.getElementById("caesar-result").textContent="";
  });

  // Vigenère
  document.getElementById("vigenere-encrypt").addEventListener("click", () => {
    const text = document.getElementById("vigenere-input").value;
    const key = document.getElementById("vigenere-key").value;
    document.getElementById("vigenere-result").textContent = vigenereCipher(text,key,true);
  });
  document.getElementById("vigenere-decrypt").addEventListener("click", () => {
    const text = document.getElementById("vigenere-input").value;
    const key = document.getElementById("vigenere-key").value;
    document.getElementById("vigenere-result").textContent = vigenereCipher(text,key,false);
  });
  document.getElementById("vigenere-reset").addEventListener("click", () => {
    document.getElementById("vigenere-input").value="";
    document.getElementById("vigenere-key").value="";
    document.getElementById("vigenere-result").textContent="";
  });

  // Atbash
  document.getElementById("atbash-run").addEventListener("click", () => {
    const text = document.getElementById("atbash-input").value;
    document.getElementById("atbash-result").textContent = atbashCipher(text);
  });
  document.getElementById("atbash-reset").addEventListener("click", () => {
    document.getElementById("atbash-input").value="";
    document.getElementById("atbash-result").textContent="";
  });

  // ROT13
  document.getElementById("rot13-run").addEventListener("click", () => {
    const text = document.getElementById("rot13-input").value;
    document.getElementById("rot13-result").textContent = rot13(text);
  });
  document.getElementById("rot13-reset").addEventListener("click", () => {
    document.getElementById("rot13-input").value="";
    document.getElementById("rot13-result").textContent="";
  });

  // Pigpen
  document.getElementById("pigpen-encode").addEventListener("click", () => {
    const text = document.getElementById("pigpen-input").value;
    document.getElementById("pigpen-result").textContent = pigpenEncode(text);
  });
  document.getElementById("pigpen-decode").addEventListener("click", () => {
    const text = document.getElementById("pigpen-input").value;
    document.getElementById("pigpen-result").textContent = pigpenDecode(text);
  });
  document.getElementById("pigpen-reset").addEventListener("click", () => {
    document.getElementById("pigpen-input").value="";
    document.getElementById("pigpen-result").textContent="";
  });

  // Playfair
  document.getElementById("playfair-encrypt").addEventListener("click", () => {
    const text = document.getElementById("playfair-input").value;
    const key = document.getElementById("playfair-key").value;
    document.getElementById("playfair-result").textContent = playfairCipher(text,key,true);
  });
  document.getElementById("playfair-decrypt").addEventListener("click", () => {
    const text = document.getElementById("playfair-input").value;
    const key = document.getElementById("playfair-key").value;
    document.getElementById("playfair-result").textContent = playfairCipher(text,key,false);
  });
  document.getElementById("playfair-reset").addEventListener("click", () => {
    document.getElementById("playfair-input").value="";
    document.getElementById("playfair-key").value="";
    document.getElementById("playfair-result").textContent="";
  });

  // ===== ANIMATIONS =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("fade-in-up");
      }
    });
  }, {threshold:0.1});

  document.querySelectorAll(".panel-grid, .learn-card, .hero-content").forEach(el=>{
    observer.observe(el);
  });
});
