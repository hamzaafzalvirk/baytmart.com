import { useEffect, useMemo, useState } from 'react'
import AdminPanel from './AdminPanel.jsx'
import './App.css'

const api = async (path, options = {}) => {
  const token = localStorage.getItem('baytmart_admin_token')
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const data = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(data?.message || 'Something went wrong')
  return data
}

const money = (value) => `$${Number(value).toFixed(2)}`

// Small line-icon set, kept dependency-free and matching the header stroke weight.
const Icon = {
  Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /></svg>,
  Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" /></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.5-4.5" strokeLinecap="round" /></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.6-3.6 4.4-5.4 7.5-5.4s5.9 1.8 7.5 5.4" strokeLinecap="round" /></svg>,
  Bag: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" /></svg>,
  Return: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9h11a4.5 4.5 0 0 1 0 9h-3" strokeLinecap="round" /><path d="M8 5 4 9l4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Origin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18M4 8l8-5 8 5M4 8v9l8 5M20 8v9l-8 5" strokeLinejoin="round" /></svg>,
  Support: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 13a8 8 0 0 1 16 0" strokeLinecap="round" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /></svg>,
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 10v9h12v-9" /></svg>,
  Grid: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>,
  Tag: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12 12 3h6a3 3 0 0 1 3 3v6l-9 9-9-9Z" strokeLinejoin="round" /><circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" /></svg>,
}

function App() {
  const [view, setView] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('baytmart_cart') || '[]'))
  const [notice, setNotice] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [checkout, setCheckout] = useState({ firstName: '', lastName: '', email: '', address: '', city: '', postalCode: '', country: 'Saudi Arabia', card: '' })
  const [adminToken, setAdminToken] = useState(localStorage.getItem('baytmart_admin_token'))
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    api(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`).then((data) => setProducts(data.data || [])).catch(() => setNotice('The catalog is unavailable. Start Laravel with php artisan serve.'))
  }, [search, category])

  useEffect(() => { api('/storefront/content').then((data) => { setCategories(data.categories || []); setMenuItems(data.menu || []) }).catch(() => {}) }, [])
  useEffect(() => { localStorage.setItem('baytmart_cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    const handleInstallPrompt = (event) => { event.preventDefault(); setInstallPrompt(event) }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  const cartItems = useMemo(() => Object.values(cart.reduce((items, product) => {
    items[product.id] = items[product.id] || { ...product, quantity: 0 }
    items[product.id].quantity += 1
    return items
  }, {})), [cart])
  const subtotal = cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0)
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12
  const total = subtotal + shipping

  const navItems = menuItems.length ? menuItems : [{ label: 'Home' }, { label: 'Shop' }, { label: 'Computer accessories', category: 'Computer Accessories' }, { label: 'Home decor', category: 'Home Decor' }]

  const addToCart = (product) => { setCart((items) => [...items, product]); setNotice(`${product.title} was added to your bag`) }
  const changeQuantity = (id, delta) => setCart((items) => {
    const index = items.findIndex((item) => item.id === id)
    if (index < 0) return items
    if (delta < 0) return items.filter((_, itemIndex) => itemIndex !== index)
    return [...items, items[index]]
  })
  const goTo = (nextView) => { setNotice(''); setView(nextView); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openProduct = (product) => { setSelectedProduct(product); goTo('product') }
  const installApp = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  const submitOrder = (event) => {
    event.preventDefault()
    api('/orders', { method: 'POST', body: JSON.stringify({ ...checkout, items: cartItems, subtotal, shipping, total }) }).then((data) => { setOrderNumber(data.order.order_number); setCart([]); goTo('success') }).catch((error) => setNotice(error.message))
  }

  return <div className="store-shell">
    <header className="site-header">
      <div className="header-row">
        <button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
          {mobileMenu ? <Icon.Close /> : <Icon.Menu />}
        </button>
        <button className="wordmark" onClick={() => goTo('home')}>Baytmart</button>
        <nav className={mobileMenu ? 'main-nav is-open' : 'main-nav'}>
          {navItems.map((item) => (
            <button
              key={item.label}
              className={view === (item.label === 'Home' ? 'home' : 'shop') && (!item.category || item.category === category) ? 'active' : ''}
              onClick={() => { if (item.category) setCategory(item.category); goTo(item.label === 'Home' ? 'home' : 'shop') }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={() => { goTo('shop'); requestAnimationFrame(() => document.querySelector('.filters input')?.focus()) }} aria-label="Search products"><Icon.Search /></button>
          <button className="icon-button" onClick={() => setNotice('Sign in from the Admin link in the footer')} aria-label="Account"><Icon.User /></button>
          <button className="bag-button" onClick={() => goTo('cart')} aria-label="Open bag">
            <Icon.Bag />
            <span className="bag-count">{cart.length}</span>
          </button>
        </div>
      </div>
      <p className="delivery-note">Free delivery on orders over $150 &nbsp; Easy returns within 30 days</p>
    </header>

    {notice && <button className="notice" onClick={() => setNotice('')}>{notice}</button>}

    {view === 'home' && (
      <section className="hero">
        <div className="hero-text">
          <h1>Furniture built to stay in the family.</h1>
          <p className="hero-lede">Solid-wood pieces and considered home objects, sourced with care and delivered across Saudi Arabia in three to five days.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => goTo('shop')}>Shop the collection</button>
            {installPrompt && <button className="btn btn-ghost" onClick={installApp}>Install the app</button>}
          </div>
          <dl className="hero-facts">
            <div><dt>Pieces in the collection</dt><dd>{products.length || '—'}</dd></div>
            <div><dt>Delivery window</dt><dd>3–5 days</dd></div>
            <div><dt>Return period</dt><dd>30 days</dd></div>
          </dl>
        </div>
        <div className="hero-visual">
          <div className="hero-frame">
            {products[0]?.image_url
              ? <img src={products[0].image_url} alt={products[0].title} />
              : <div className="hero-frame-empty">Baytmart</div>}
          </div>
          {products[0] && (
            <div className="hero-tag">
              <span className="hero-tag-name">{products[0].title}</span>
              <span className="hero-tag-price">{money(products[0].price)}</span>
            </div>
          )}
        </div>
      </section>
    )}

    {(view === 'home' || view === 'shop') && <>
      <section className="market-categories">
        <button className={category === '' ? 'active' : ''} onClick={() => setCategory('')}>All</button>
        {categories.map((item) => <button key={item.id || item.name} className={category === (item.name || item) ? 'active' : ''} onClick={() => setCategory(item.name || item)}>{item.name || item}</button>)}
      </section>
      <section className="market-promos">
        <article className="promo-sale"><small>Summer sale</small><strong>Up to 50% off selected pieces</strong><button onClick={() => setCategory('')}>Shop now</button></article>
        <article className="promo-new"><small>New arrivals</small><strong>This week's new objects</strong><button onClick={() => setCategory('')}>Explore</button></article>
        <article className="promo-delivery"><small>Fast delivery</small><strong>Across Saudi Arabia</strong><span>24h dispatch</span></article>
      </section>
      <section className="catalog-head">
        <div><h2>Shop all essentials</h2></div>
        <div className="filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item.id || item.name} value={item.name || item}>{item.name || item}</option>)}</select></div>
      </section>
      <section className="product-grid">{products.length ? products.map((product) => <article className="product-card" key={product.id}><button className="product-link" onClick={() => openProduct(product)}><div className="product-image">{product.image_url ? <img src={product.image_url} alt={product.title} /> : <span className="product-image-empty">{product.category}</span>}<span className="view-label">View product</span>{product.is_featured && <span className="featured-label">Featured</span>}</div><p className="category">{product.category}</p><h3>{product.title}</h3><strong>{money(product.price)}</strong>{product.compare_at_price && <del>{money(product.compare_at_price)}</del>}</button><button className="quick-add" onClick={() => addToCart(product)} aria-label={`Add ${product.title} to bag`}>+</button></article>) : <div className="empty">No products found.</div>}</section>
      <section className="benefits-strip">
        <span><Icon.Shield /><b>Secure payments</b><small>100% secure checkout</small></span>
        <span><Icon.Return /><b>Easy returns</b><small>30-day return policy</small></span>
        <span><Icon.Origin /><b>Genuine pieces</b><small>Sourced and checked</small></span>
        <span><Icon.Support /><b>Here to help</b><small>Real support, real answers</small></span>
      </section>
      <nav className="mobile-tabbar">
        <button className={view === 'shop' ? 'active' : ''} onClick={() => goTo('shop')}><Icon.Home /><small>Home</small></button>
        <button onClick={() => setCategory('')}><Icon.Grid /><small>Categories</small></button>
        <button onClick={() => setNotice('Deals are updated daily')}><Icon.Tag /><small>Deals</small></button>
        <button onClick={() => goTo('cart')}><Icon.Bag /><small>Bag</small></button>
        <button onClick={() => goTo('admin')}><Icon.User /><small>Account</small></button>
      </nav>
    </>}

    {view === 'product' && selectedProduct && <section className="product-detail"><button className="back-link" onClick={() => goTo('shop')}>Back to collection</button><div className="detail-layout"><div className="detail-image">{selectedProduct.image_url ? <img src={selectedProduct.image_url} alt={selectedProduct.title} /> : <span className="product-image-empty">{selectedProduct.category}</span>}</div><div className="detail-copy"><p className="detail-category">{selectedProduct.category}</p><h1>{selectedProduct.title}</h1><div className="detail-price">{money(selectedProduct.price)}</div><p className="detail-description">{selectedProduct.description || 'A considered Baytmart essential made for daily use, with a simple form and lasting utility.'}</p><div className="detail-meta"><span><b>In stock</b>{selectedProduct.stock} available</span><span><b>Delivery</b>3–5 business days</span></div><button className="btn btn-primary detail-button" onClick={() => { addToCart(selectedProduct); goTo('cart') }}>Add to bag</button><p className="detail-note">Free delivery on orders over $150. Easy returns within 30 days.</p></div></div><div className="detail-story"><h2>Made to earn its place.</h2><p>Simple, useful, and easy to live with. Every Baytmart object is chosen for the difference it makes to an everyday routine.</p></div></section>}

    {view === 'cart' && <section className="page-section checkout-layout"><div><h2>Your shopping bag</h2>{cartItems.length ? cartItems.map((item) => <div className="cart-row" key={item.id}><img src={item.image_url} alt="" /><div><h3>{item.title}</h3><p>{item.category}</p><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Decrease ${item.title}`}>−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Increase ${item.title}`}>+</button><button className="remove-link" onClick={() => setCart((items) => items.filter((cartItem) => cartItem.id !== item.id))}>Remove</button></div></div><strong>{money(Number(item.price) * item.quantity)}</strong></div>) : <div className="empty cart-empty">Your bag is waiting for something good.</div>}</div><aside className="summary"><h2>Order summary</h2><Summary subtotal={subtotal} shipping={shipping} total={total} /><button className="btn btn-primary full" disabled={!cartItems.length} onClick={() => goTo('checkout')}>Continue to checkout</button><small>Free delivery on orders over $150</small></aside></section>}
    {view === 'checkout' && <section className="page-section checkout-layout"><form className="checkout-form" onSubmit={submitOrder}><div className="checkout-title"><h2>Delivery details</h2></div><div className="form-grid"><label>First name<input required value={checkout.firstName} onChange={(event) => setCheckout({ ...checkout, firstName: event.target.value })} /></label><label>Last name<input required value={checkout.lastName} onChange={(event) => setCheckout({ ...checkout, lastName: event.target.value })} /></label><label className="wide">Email address<input type="email" required value={checkout.email} onChange={(event) => setCheckout({ ...checkout, email: event.target.value })} /></label><label className="wide">Street address<input required value={checkout.address} onChange={(event) => setCheckout({ ...checkout, address: event.target.value })} /></label><label>City<input required value={checkout.city} onChange={(event) => setCheckout({ ...checkout, city: event.target.value })} /></label><label>Postal code<input required value={checkout.postalCode} onChange={(event) => setCheckout({ ...checkout, postalCode: event.target.value })} /></label><label className="wide">Country<select value={checkout.country} onChange={(event) => setCheckout({ ...checkout, country: event.target.value })}><option>Saudi Arabia</option><option>United Arab Emirates</option><option>Qatar</option></select></label></div><div className="payment-heading"><h3>Card details</h3></div><label className="wide">Card number<input required inputMode="numeric" pattern="[0-9 ]{12,19}" value={checkout.card} onChange={(event) => setCheckout({ ...checkout, card: event.target.value })} placeholder="1234 5678 9012 3456" /></label><button className="btn btn-primary full" type="submit">Place order</button><small className="secure-note">Demo checkout. Connect a payment provider before taking live payments.</small></form><aside className="summary"><h2>Your order</h2><Summary subtotal={subtotal} shipping={shipping} total={total} />{cartItems.map((item) => <div className="mini-item" key={item.id}><span>{item.quantity} × {item.title}</span><strong>{money(Number(item.price) * item.quantity)}</strong></div>)}</aside></section>}
    {view === 'success' && <section className="success-page"><div className="success-mark">✓</div><h1>Thank you, {checkout.firstName || 'friend'}.</h1><p>We have received your order and will send delivery updates to <strong>{checkout.email}</strong>.</p><div className="order-card"><span>Order number</span><strong>{orderNumber}</strong><span>Estimated delivery</span><strong>3–5 business days</strong></div><button className="btn btn-primary" onClick={() => goTo('shop')}>Continue shopping</button></section>}
    {view === 'admin' && <AdminPanel api={api} adminToken={adminToken} setAdminToken={setAdminToken} setNotice={setNotice} />}

    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-about">
          <button className="wordmark" onClick={() => goTo('home')}>Baytmart</button>
          <p>Everyday furniture and home objects, made to last and easy to live with.</p>
        </div>
        <div className="footer-nav">
          <div className="footer-column">
            <h3>Shop</h3>
            <button onClick={() => goTo('home')}>Home</button>
            <button onClick={() => goTo('shop')}>All products</button>
            <button onClick={() => { setCategory('Computer Accessories'); goTo('shop') }}>Computer accessories</button>
            <button onClick={() => { setCategory('Home Decor'); goTo('shop') }}>Home decor</button>
          </div>
          <div className="footer-column">
            <h3>Help</h3>
            <button onClick={() => setNotice('Email hello@baytmart.com for support')}>Contact us</button>
            <button onClick={() => setNotice('Returns are accepted within 30 days')}>Shipping and returns</button>
            <button onClick={() => setNotice('Orders are delivered in 3–5 business days')}>Delivery info</button>
          </div>
        </div>
        <form className="footer-newsletter" onSubmit={(event) => { event.preventDefault(); setNotice('Thanks for signing up') }}>
          <h3>Stay in the loop</h3>
          <p>New pieces and useful ideas, sent occasionally.</p>
          <div className="newsletter-field">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input id="newsletter-email" type="email" required placeholder="Your email address" />
            <button type="submit">Subscribe</button>
          </div>
        </form>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Baytmart</span>
        <button className="footer-admin-link" onClick={() => goTo('admin')}>Admin</button>
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </footer>
  </div>
}

function Summary({ subtotal, shipping, total }) {
  return <div className="summary-lines"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Delivery</span><strong>{shipping ? money(shipping) : 'Free'}</strong></div><div className="total-line"><span>Total</span><strong>{money(total)}</strong></div></div>
}

export default App