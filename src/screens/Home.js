
import { useState, useEffect } from 'react';
import { products, stores, orders } from '../services/api';
import { formatPrice, getCountry } from '../utils/currency';

export default function Home({ user, cart, cartCount, addToCart, setCart, selectedStore, setSelectedStore, logout }) {
  const [screen, setScreen] = useState('home');
  const [productList, setProductList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const userCountry = user.country || 'TZ';
  const country = getCountry(userCountry);
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (screen === 'orders') loadOrders(); }, [screen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, st] = await Promise.all([products.getAll(), stores.getAll()]);
      const allP = p.data.products || [];
      const allS = st.data.stores || [];
      const myStores = allS.filter(x => !x.country || x.country === userCountry);
      setStoreList(myStores);
    } catch (err) { showToast('Could not load'); }
    setLoading(false);
  };

  const loadOrders = async () => {
    try {
      const res = await orders.getByBuyer(user.id);
      setMyOrders(res.data.orders || []);
    } catch (e) { showToast('Could not load orders'); }
  };

  const placeOrder = async () => {
    if (cart.length === 0) return showToast('Cart is empty');
    if (placingOrder) return;
    setPlacingOrder(true);
    try {
      const items = cart.map(i => ({
        product_id: i.id,
        quantity: i.qty,
        unit_price: Number(i.retail_price),
        wholesaler_id: null
      }));
      await orders.create({ buyer_id: user.id, store_id: selectedStore.id, items });
      setCart([]);
      showToast('Order placed! Collect at ' + selectedStore.store_name);
      await loadOrders();
      setScreen('orders');
    } catch(e) {
      showToast('Error: ' + (e.response?.data?.error || e.message || 'Failed'));
    }
    setPlacingOrder(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const subtotal = cart.reduce((a, b) => a + (Number(b.retail_price) * b.qty), 0);
  const total = subtotal * 0.88;

  const Nav = () => (
    <div style={{background:'#fff',borderTop:'1px solid #E8DDD4',padding:'10px 0 18px',display:'flex',justifyContent:'space-around',flexShrink:0}}>
      {[{e:'🏠',l:'Home',id:'home'},{e:'🛒',l:'Cart',id:'cart'},{e:'📦',l:'Orders',id:'orders'},{e:'🏪',l:'Stores',id:'stores'},{e:'👤',l:'Logout',id:'out'}].map(n => (
        <button key={n.id} onClick={() => n.id==='out'?logout():setScreen(n.id)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,border:'none',background:'none',cursor:'pointer',padding:'4px 10px'}}>
          <span style={{fontSize:20,position:'relative'}}>{n.e}{n.id==='cart'&&cartCount>0&&<span style={{position:'absolute',top:-4,right:-8,width:16,height:16,background:'#C8541A',borderRadius:'50%',fontSize:9,fontWeight:800,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>{cartCount}</span>}</span>
          <span style={{fontSize:10,fontWeight:600,color:screen===n.id?'#C8541A':'#9C8878'}}>{n.l}</span>
        </button>
      ))}
    </div>
  );

  if (screen==='detail' && selectedProduct) return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div style={{background:'#fff',padding:'14px 20px',borderBottom:'1px solid #E8DDD4',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={()=>setScreen('home')} style={{width:36,height:36,borderRadius:'50%',background:'#FAF6F0',border:'none',fontSize:18,cursor:'pointer'}}>←</button>
        <span style={{fontWeight:700}}>Product Detail</span>
      </div>
      <div style={{overflowY:'auto',flex:1,padding:20}}>
        <div style={{textAlign:'center',fontSize:80,marginBottom:16}}>📦</div>
        <div style={{fontSize:20,fontWeight:800,color:'#1C1410',marginBottom:4}}>{selectedProduct.name}</div>
        <div style={{fontSize:13,color:'#9C8878',marginBottom:12}}>By {selectedProduct.brand}</div>
        <div style={{fontSize:26,fontWeight:800,color:'#C8541A',marginBottom:4}}>{formatPrice(selectedProduct.retail_price, userCountry)}</div>
        <div style={{fontSize:12,color:'#9C8878',textDecoration:'line-through',marginBottom:16}}>{formatPrice(selectedProduct.retail_price*1.12, userCountry)} market price</div>
        <div style={{background:'#E8F5EE',borderRadius:12,padding:12,marginBottom:16}}>
          <div style={{fontWeight:700,color:'#00875A',fontSize:13}}>✓ Verified · ✓ Approved Wholesaler</div>
          <div style={{fontSize:12,color:'#1A4731',marginTop:4}}>{selectedProduct.description}</div>
          {selectedStore&&<div style={{fontSize:12,marginTop:6,fontWeight:600,color:'#1A4731'}}>🏪 Pickup: {selectedStore.store_name}</div>}
        </div>
        <div style={{display:'flex',gap:11,alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',background:'#fff',borderRadius:12,border:'1.5px solid #E8DDD4'}}>
            <button onClick={()=>setQty(Math.max(1,qty-1))} style={{width:38,height:46,border:'none',background:'none',fontSize:20,cursor:'pointer'}}>−</button>
            <span style={{width:34,textAlign:'center',fontWeight:700}}>{qty}</span>
            <button onClick={()=>setQty(qty+1)} style={{width:38,height:46,border:'none',background:'none',fontSize:20,cursor:'pointer'}}>+</button>
          </div>
          <button onClick={()=>{addToCart(selectedProduct,qty);showToast('Added! Stock reserved.');setScreen('home');}} style={{flex:1,height:46,background:'#C8541A',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer'}}>Add to Cart</button>
        </div>
      </div>
    </div>
  );

  if (screen==='cart') return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div style={{background:'#fff',padding:'14px 20px',borderBottom:'1px solid #E8DDD4',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <span style={{fontWeight:800,fontSize:18}}>My Cart ({cartCount})</span>
        <button onClick={()=>setCart([])} style={{fontSize:12,color:'#C8541A',fontWeight:600,border:'none',background:'none',cursor:'pointer'}}>Clear</button>
      </div>
      <div style={{overflowY:'auto',flex:1,padding:14}}>
        {cart.length===0?<div style={{textAlign:'center',padding:60,color:'#9C8878'}}><div style={{fontSize:48}}>🛒</div><div style={{fontWeight:600,marginTop:8}}>Cart is empty</div><button onClick={()=>setScreen('home')} style={{marginTop:16,padding:'10px 24px',background:'#C8541A',color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer'}}>Browse Products</button></div>:(<>
          <div style={{background:'#E8F5EE',border:'1px solid #00875A',borderRadius:12,padding:12,marginBottom:12,display:'flex',gap:8}}><span>🔒</span><div><div style={{fontWeight:700,color:'#00875A',fontSize:12}}>Stock Reserved</div><div style={{fontSize:11}}>Items locked for you only</div></div></div>
          {cart.map((item,i)=>(
            <div key={i} style={{background:'#fff',borderRadius:12,padding:12,marginBottom:10,display:'flex',gap:12,boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <div style={{fontSize:32,flexShrink:0}}>📦</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{item.name}</div>
                <div style={{fontSize:11,color:'#9C8878',marginBottom:6}}>{item.brand}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontWeight:800,color:'#C8541A'}}>{formatPrice(item.retail_price,userCountry)}</span>
                  <div style={{display:'flex',gap:6,alignItems:'center',background:'#FAF6F0',borderRadius:8,padding:'3px 8px'}}>
                    <button onClick={()=>setCart(p=>p.map((x,j)=>j===i?{...x,qty:Math.max(1,x.qty-1)}:x))} style={{border:'none',background:'none',fontSize:16,cursor:'pointer'}}>−</button>
                    <span style={{fontWeight:700,minWidth:14,textAlign:'center'}}>{item.qty}</span>
                    <button onClick={()=>setCart(p=>p.map((x,j)=>j===i?{...x,qty:x.qty+1}:x))} style={{border:'none',background:'none',fontSize:16,cursor:'pointer'}}>+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {selectedStore&&<div style={{background:'#1A4731',borderRadius:12,padding:'13px 15px',marginBottom:12,display:'flex',alignItems:'center',gap:11,color:'#fff'}}><span style={{fontSize:22}}>🏪</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{selectedStore.store_name}</div><div style={{fontSize:11,opacity:.7}}>{country.payment} · Ready ~2hrs after order</div></div></div>}
          <div style={{background:'#fff',borderRadius:12,padding:15,marginBottom:12}}>
            <div style={{fontWeight:700,marginBottom:10}}>Order Summary</div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#4A3728',marginBottom:6}}><span>Subtotal</span><span>{formatPrice(subtotal,userCountry)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}><span style={{color:'#4A3728'}}>Pickup fee</span><span style={{color:'#00875A',fontWeight:700}}>FREE</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}><span style={{color:'#4A3728'}}>Saving (12%)</span><span style={{color:'#00875A'}}>-{formatPrice(subtotal*0.12,userCountry)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,borderTop:'1px solid #E8DDD4',paddingTop:8}}><span>Total</span><span style={{color:'#C8541A',fontSize:16}}>{formatPrice(total,userCountry)}</span></div>
          </div>
          <button onClick={placeOrder} disabled={placingOrder} style={{width:'100%',height:52,background:placingOrder?'#9C8878':'#C8541A',color:'#fff',border:'none',borderRadius:14,fontSize:16,fontWeight:700,cursor:placingOrder?'not-allowed':'pointer'}}>
            {placingOrder ? 'Placing Order...' : 'Confirm Order · ' + formatPrice(total,userCountry) + ' →'}
          </button>
        </>)}
      </div>
      <Nav/>
    </div>
  );

  if (screen==='orders') return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div style={{background:'#fff',padding:'14px 20px',borderBottom:'1px solid #E8DDD4',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={()=>setScreen('home')} style={{width:36,height:36,borderRadius:'50%',background:'#FAF6F0',border:'none',fontSize:18,cursor:'pointer'}}>←</button>
        <span style={{fontWeight:700}}>My Orders</span>
      </div>
      <div style={{overflowY:'auto',flex:1,padding:14}}>
        {myOrders.length===0?<div style={{textAlign:'center',padding:60,color:'#9C8878'}}><div style={{fontSize:48}}>📦</div><div style={{fontWeight:600,marginTop:8}}>No orders yet</div></div>:myOrders.map(o=>(
          <div key={o.id} style={{background:'#fff',borderRadius:12,padding:14,marginBottom:10,boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontWeight:700,fontSize:13}}>{o.order_number}</div>
              <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:12,background:'#E8F5EE',color:'#00875A'}}>{o.status}</span>
            </div>
            <div style={{height:4,background:'#E8DDD4',borderRadius:2,overflow:'hidden',marginBottom:8}}><div style={{height:'100%',borderRadius:2,background:'#00875A',width:({'PENDING':'10%','CONFIRMED':'30%','PROCESSING':'55%','PACKED':'75%','READY':'90%','COLLECTED':'100%'}[o.status]||'10%')}}/></div>
            <div style={{background:'#FAF6F0',borderRadius:8,padding:'8px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{o.stores?o.stores.store_name:''}</div><div style={{fontSize:11,color:'#9C8878'}}>Code: <strong>{o.pickup_code}</strong></div></div>
              <span style={{fontWeight:800,color:'#C8541A'}}>{formatPrice(o.total,userCountry)}</span>
            </div>
          </div>
        ))}
      </div>
      <Nav/>
    </div>
  );

  if (screen==='stores') return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div style={{background:'#fff',padding:'14px 20px',borderBottom:'1px solid #E8DDD4',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={()=>setScreen('home')} style={{width:36,height:36,borderRadius:'50%',background:'#FAF6F0',border:'none',fontSize:18,cursor:'pointer'}}>←</button>
        <span style={{fontWeight:700}}>Choose Pickup Store</span>
      </div>
      <div style={{overflowY:'auto',flex:1,padding:14}}>
        <div style={{fontSize:12,color:'#9C8878',marginBottom:12}}>{country.flag} Showing stores in {country.name}</div>
        {storeList.length===0?<div style={{textAlign:'center',padding:40,color:'#9C8878'}}>No stores available yet</div>:storeList.map(s=>(
          <div key={s.id} onClick={()=>{setSelectedStore(s);setScreen('home');}} style={{background:'#fff',borderRadius:12,padding:14,marginBottom:10,border:selectedStore&&selectedStore.id===s.id?'2px solid #1A4731':'2px solid transparent',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div style={{fontWeight:700}}>🏪 {s.store_name}</div>
              {selectedStore&&selectedStore.id===s.id&&<span style={{fontSize:11,fontWeight:700,color:'#00875A',background:'#E8F5EE',padding:'2px 8px',borderRadius:10}}>Selected</span>}
            </div>
            <div style={{fontSize:12,color:'#9C8878',marginBottom:10}}>{s.address}, {s.city}</div>
            <div style={{background:selectedStore&&selectedStore.id===s.id?'#00875A':'#1A4731',color:'#fff',borderRadius:8,padding:8,textAlign:'center',fontWeight:700,fontSize:13}}>{selectedStore&&selectedStore.id===s.id?'✓ Selected':'Select Store'}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflowY:'auto'}}>
      <div style={{background:'#1A4731',padding:'16px 20px 22px',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div onClick={()=>setScreen('stores')} style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,.13)',padding:'6px 12px',borderRadius:20,color:'#fff',fontSize:12,cursor:'pointer'}}>
            <span style={{width:7,height:7,background:'#F0A500',borderRadius:'50%',display:'inline-block'}}/>
            <span>{selectedStore?selectedStore.store_name.split('–')[0].trim():'Select Store'}</span>
            <span style={{opacity:.5}}>▾</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{color:'#fff',fontSize:16}}>{country.flag}</span>
            <button onClick={logout} style={{width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,.13)',border:'none',color:'#fff',fontSize:16,cursor:'pointer'}}>👤</button>
          </div>
        </div>
        <div style={{color:'rgba(255,255,255,.7)',fontSize:13,marginBottom:2}}>{greeting}, <strong style={{color:'#fff'}}>{user.full_name?user.full_name.split(' ')[0]:'there'}</strong> 👋</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',marginBottom:10}}>{country.flag} {country.name} · {country.currency} · {country.payment}</div>
        <div style={{display:'flex',alignItems:'center',gap:10,background:'#fff',borderRadius:13,padding:'11px 14px'}}>
          <span style={{color:'#9C8878'}}>🔍</span>
          <span style={{color:'#9C8878',fontSize:14}}>Search verified products…</span>
        </div>
      </div>
      <div style={{padding:14,flex:1}}>
        <div style={{fontSize:16,fontWeight:700,color:'#1C1410',marginBottom:12}}>Available in {country.name}</div>
        {loading?<div style={{textAlign:'center',padding:40,color:'#9C8878'}}>Loading products…</div>:productList.length===0?<div style={{textAlign:'center',padding:40,color:'#9C8878'}}><div style={{fontSize:48}}>🛍️</div><div style={{fontWeight:600,marginTop:8}}>No products yet</div></div>:(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
            {productList.map(p=>(
              <div key={p.id} onClick={()=>{setSelectedProduct(p);setQty(1);setScreen('detail');}} style={{background:'#fff',borderRadius:16,overflow:'hidden',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
                <div style={{height:110,display:'flex',alignItems:'center',justifyContent:'center',background:'#F5F0EA',fontSize:44,position:'relative'}}>
                  📦
                  {p.is_verified&&<div style={{position:'absolute',top:7,left:7,background:'#00875A',color:'#fff',fontSize:9,fontWeight:800,padding:'3px 7px',borderRadius:6}}>✓ VERIFIED</div>}
                </div>
                <div style={{padding:'9px 11px 11px'}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#1C1410',marginBottom:2,lineHeight:1.3}}>{p.name}</div>
                  <div style={{fontSize:11,color:'#9C8878',marginBottom:7}}>{p.brand}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:14,fontWeight:800,color:'#C8541A'}}>{formatPrice(p.retail_price,userCountry)}</span>
                    <button onClick={e=>{e.stopPropagation();addToCart(p,1);showToast('Added!');}} style={{width:28,height:28,background:'#1A4731',border:'none',borderRadius:8,color:'#fff',fontSize:18,cursor:'pointer'}}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{height:20}}/>
      <Nav/>
      {toast&&<div style={{position:'fixed',bottom:100,left:'50%',transform:'translateX(-50%)',background:'#1C1410',color:'#fff',padding:'9px 18px',borderRadius:28,fontSize:13,fontWeight:600,whiteSpace:'nowrap',zIndex:999}}>{toast}</div>}
    </div>
  );
}
