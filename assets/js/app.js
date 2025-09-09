document.addEventListener('DOMContentLoaded',()=>{
  const yearEl=document.getElementById('year');
  if(yearEl){yearEl.textContent=String(new Date().getFullYear());}

  const params=new URLSearchParams(location.search);
  const q=params.get('q');
  const searchInput=document.querySelector('form.search input[type="search"]');
  if(searchInput && q){searchInput.value=q;}

  // Auto-render YouTube section if placeholder exists
  const videoMount=document.getElementById('videoMount');
  if(videoMount){
    renderYoutube(videoMount);
  }

  // Update login/logout button state if present
  const loginLink=document.querySelector('a[href="login.html"].btn');
  if(loginLink){
    const u=auth.user();
    loginLink.textContent=u?`Logout (${u.email})`:'Login';
    loginLink.addEventListener('click',e=>{
      if(auth.user()){
        e.preventDefault();auth.logout();location.reload();
      }
    });
  }
});

// Simple localStorage helpers
const store={
  get(key, fallback){
    try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback;}catch{return fallback}
  },
  set(key, value){localStorage.setItem(key, JSON.stringify(value));}
};

function renderYoutube(mount){
  const params=new URLSearchParams(location.search);
  const ytId=params.get('yt');
  const title=document.querySelector('h1')?.textContent?.trim()||document.title||'PC fix';
  const query=encodeURIComponent(title.replace(/\s+/g,' '));
  const searchUrl=`https://www.youtube.com/results?search_query=${query}`;
  let inner='';
  if(ytId){
    inner=`<div class="iframe-wrap"><iframe src="https://www.youtube.com/embed/${ytId}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
  } else {
    inner=`<p class="muted">Prefer video? Watch a related guide on YouTube.</p>`;
  }
  mount.innerHTML=`<div class="video">${inner}<div class="video-actions"><a class="btn" target="_blank" rel="noopener" href="${searchUrl}">Search on YouTube</a></div></div>`;
}

// Captcha utility (very simple math captcha)
const captcha={
  create(targetId){
    const a=Math.floor(Math.random()*9)+1;
    const b=Math.floor(Math.random()*9)+1;
    const answer=a+b;
    const id=`cap-${Math.random().toString(36).slice(2,8)}`;
    const mount=document.getElementById(targetId);
    mount.innerHTML=`<div class="row"><div class="badge">What is ${a} + ${b}?</div><input id="${id}" placeholder="Answer"></div>`;
    return {id, answer};
  },
  validate(ctx){
    const el=document.getElementById(ctx.id);
    const ok=Number(el.value)==ctx.answer;
    if(!ok){el.focus();el.value='';el.placeholder='Try again';}
    return ok;
  },
  refresh(ctx){
    const parent=document.getElementById(ctx.id).parentElement.parentElement.id;
    return this.create(parent);
  }
};

// Simple auth demo
const auth={
  register(email, password){
    if(!email||!password) return false;
    const users=store.get('users',{});
    if(users[email]) return false;
    users[email]={email, password};
    store.set('users',users);
    store.set('session',{email});
    return true;
  },
  login(email, password){
    const users=store.get('users',{});
    if(!users[email]||users[email].password!==password) return false;
    store.set('session',{email});
    return true;
  },
  logout(){localStorage.removeItem('session');},
  user(){return store.get('session',null);}
};

function authSyncUI(){
  const u=auth.user();
  const btnLogout=document.getElementById('btnLogout');
  if(btnLogout){btnLogout.style.display=u?'inline-flex':'none';}
} 