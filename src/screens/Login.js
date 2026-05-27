import { useState } from 'react';
import { auth } from '../services/api';
import { COUNTRIES } from '../utils/currency';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', country: 'TZ' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { data } = await auth.login({ email: form.email, password: form.password });
        onLogin(data.profile, data.token);
      } else {
        await auth.register(form);
        setMode('login');
        setError('Account created! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'#1A4731',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:42,fontWeight:800,color:'#fff'}}>Shop<span style={{color:'#F0A500'}}>stoo</span></div>
        <div style={{color:'rgba(255,255,255,.7)',fontSize:15,marginTop:6}}>Buy verified. Collect local.</div>
      </div>
      <div style={{background:'#fff',borderRadius:24,padding:24,width:'100%',maxWidth:360}}>
        <div style={{display:'flex',marginBottom:20,background:'#FAF6F0',borderRadius:12,padding:4}}>
          <button style={{flex:1,padding:10,border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',background:mode==='login'?'#fff':'none',color:mode==='login'?'#1C1410':'#9C8878'}} onClick={()=>setMode('login')}>Login</button>
          <button style={{flex:1,padding:10,border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',background:mode==='register'?'#fff':'none',color:mode==='register'?'#1C1410':'#9C8878'}} onClick={()=>setMode('register')}>Register</button>
        </div>
        {mode==='register' && <>
          <input style={{width:'100%',padding:'13px 16px',border:'1.5px solid #E8DDD4',borderRadius:12,fontSize:14,marginBottom:12,outline:'none',display:'block'}} name="full_name" placeholder="Full Name" value={form.full_name} onChange={handle}/>
          <input style={{width:'100%',padding:'13px 16px',border:'1.5px solid #E8DDD4',borderRadius:12,fontSize:14,marginBottom:12,outline:'none',display:'block'}} name="phone" placeholder="Phone number" value={form.phone} onChange={handle}/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:'#4A3728',marginBottom:6}}>Select Country</div>
            <div style={{display:'flex',gap:8}}>
              {Object.entries(COUNTRIES).map(([code, c]) => (
                <div key={code} onClick={()=>setForm({...form,country:code})} style={{flex:1,padding:'10px',border:form.country===code?'2px solid #1A4731':'1.5px solid #E8DDD4',borderRadius:12,cursor:'pointer',textAlign:'center',background:form.country===code?'#EAF3EE':'#fff'}}>
                  <div style={{fontSize:24}}>{c.flag}</div>
                  <div style={{fontSize:12,fontWeight:700,color:form.country===code?'#1A4731':'#9C8878',marginTop:4}}>{c.name}</div>
                  <div style={{fontSize:10,color:'#9C8878'}}>{c.currency}</div>
                </div>
              ))}
            </div>
          </div>
        </>}
        <input style={{width:'100%',padding:'13px 16px',border:'1.5px solid #E8DDD4',borderRadius:12,fontSize:14,marginBottom:12,outline:'none',display:'block'}} name="email" placeholder="Email" type="email" value={form.email} onChange={handle}/>
        <input style={{width:'100%',padding:'13px 16px',border:'1.5px solid #E8DDD4',borderRadius:12,fontSize:14,marginBottom:12,outline:'none',display:'block'}} name="password" placeholder="Password" type="password" value={form.password} onChange={handle}/>
        {error && <div style={{fontSize:13,color:'#C8541A',marginBottom:12,textAlign:'center'}}>{error}</div>}
        <button style={{width:'100%',padding:14,background:'#C8541A',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer'}} onClick={submit} disabled={loading}>
          {loading ? 'Please wait...' : mode==='login' ? 'Login to Shopstoo' : 'Create Account'}
        </button>
        {mode==='login' && <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'#9C8878'}}>New? <span style={{color:'#C8541A',fontWeight:700,cursor:'pointer'}} onClick={()=>setMode('register')}>Create account</span></div>}
      </div>
      <div style={{display:'flex',gap:8,marginTop:24,flexWrap:'wrap',justifyContent:'center'}}>
        {['Tanzania','Kenya','Verified Products','Click & Collect'].map(t=>(
          <span key={t} style={{background:'rgba(255,255,255,.15)',color:'#fff',fontSize:12,fontWeight:600,padding:'6px 12px',borderRadius:20}}>{t}</span>
        ))}
      </div>
    </div>
  );
}
