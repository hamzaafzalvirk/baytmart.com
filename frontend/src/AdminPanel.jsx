import { useCallback, useEffect, useState } from 'react'
import AdminModules from './AdminModules.jsx'

const blankProduct = {
  title: '', sku: '', brand: '', category: 'Computer Accessories', description: '', image_url: '', source_url: '', source_price: '', price: '', compare_at_price: '', stock: 0, weight: '', tags: '', seo_title: '', seo_description: '', is_active: true, is_featured: false, track_inventory: true, allow_backorder: false, options: [], variants: [],
}

const parseList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean)
const money = (value) => `$${Number(value).toFixed(2)}`

export default function AdminPanel({ api, adminToken, setAdminToken, setNotice }) {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [login, setLogin] = useState({ email: 'admin@baytmart.com', password: 'password' })
  const [importForm, setImportForm] = useState({ url: '', category: 'Computer Accessories', stock: 10 })
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('Products')

  const loadProducts = useCallback(() => api('/admin/products').then((data) => setProducts(data.data || [])).catch((error) => setNotice(error.message)), [api, setNotice])
  useEffect(() => { if (adminToken) loadProducts() }, [adminToken, loadProducts])

  const signIn = async (event) => {
    event.preventDefault()
    try {
      const data = await api('/admin/login', { method: 'POST', body: JSON.stringify(login) })
      localStorage.setItem('baytmart_admin_token', data.token)
      setAdminToken(data.token)
      setNotice('Admin session started.')
    } catch (error) { setNotice(error.message) }
  }

  const importProduct = async (event) => {
    event.preventDefault()
    try {
      await api('/admin/products/import', { method: 'POST', body: JSON.stringify(importForm) })
      setImportForm({ ...importForm, url: '' })
      setNotice('Product imported with a 40% markup.')
      loadProducts()
    } catch (error) { setNotice(error.message) }
  }

  const editProduct = (product) => setEditing({ ...blankProduct, ...product, tags: (product.tags || []).join(', '), options: product.options || [], variants: product.variants || [] })
  const updateField = (field, value) => setEditing((current) => ({ ...current, [field]: value }))
  const addOption = () => updateField('options', [...editing.options, { name: '', values: [''] }])
  const updateOption = (index, field, value) => updateField('options', editing.options.map((option, optionIndex) => optionIndex === index ? { ...option, [field]: value } : option))
  const addVariant = () => updateField('variants', [...editing.variants, { title: '', sku: '', price: editing.price || 0, stock: 0 }])
  const updateVariant = (index, field, value) => updateField('variants', editing.variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, [field]: value } : variant))

  const saveProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = { ...editing, tags: parseList(editing.tags), options: editing.options.filter((option) => option.name), variants: editing.variants.filter((variant) => variant.title), source_price: Number(editing.source_price || editing.price), price: Number(editing.price), compare_at_price: editing.compare_at_price ? Number(editing.compare_at_price) : null, stock: Number(editing.stock), weight: editing.weight ? Number(editing.weight) : null }
      const endpoint = editing.id ? `/admin/products/${editing.id}` : '/admin/products'
      await api(endpoint, { method: editing.id ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      setEditing(null)
      setNotice('Product settings saved.')
      loadProducts()
    } catch (error) { setNotice(error.message) } finally { setSaving(false) }
  }

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete ${product.title}?`)) return
    try { await api(`/admin/products/${product.id}`, { method: 'DELETE' }); setNotice('Product deleted.'); loadProducts() } catch (error) { setNotice(error.message) }
  }

  if (!adminToken) return <section className="admin-page"><div className="catalog-head"><div><p className="eyebrow">Control room</p><h2>Store administration</h2></div></div><form className="admin-login" onSubmit={signIn}><h3>Admin sign in</h3><input type="email" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} /><input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /><button className="button">Open dashboard</button><small>Development account: admin@baytmart.com / password</small></form></section>

  const navGroups = [['Main', ['Dashboard']], ['Catalog', ['Products', 'Import / Export', 'Categories', 'Size Charts', 'Reviews']], ['Sales', ['Orders', 'Customers']], ['Content', ['Banners', 'Navigation']], ['Store', ['Shipping & Tax', 'Plugins']]]
  const chooseSection = (section) => { setActiveSection(section); if (section !== 'Products') setNotice(`${section} workspace is ready for the next module.`) }

  return <section className="admin-page admin-dashboard"><aside className="admin-sidebar"><div className="admin-logo"><span>✦</span><div>bayt<span>mart</span><small>ADMIN PANEL</small></div></div>{navGroups.map(([group, items]) => <div className="admin-nav-group" key={group}><p>{group}</p>{items.map((item) => <button className={activeSection === item ? 'active' : ''} onClick={() => chooseSection(item)} key={item}><span className="nav-symbol">{item === 'Products' ? '◇' : item === 'Orders' ? '▣' : item === 'Customers' ? '♙' : item === 'Dashboard' ? '▦' : '○'}</span>{item}{item === 'Orders' && <b>4</b>}</button>)}</div>)}</aside><div className="admin-main"><div className="admin-topbar"><div><strong>{activeSection}</strong><small>{activeSection === 'Products' ? 'Manage your product catalog' : 'BaytMart store workspace'}</small></div><div className="admin-top-actions"><input placeholder="⌕  Quick search..." /><span>♢</span><span className="admin-user-dot">●</span><span>Admin</span><button onClick={() => { localStorage.removeItem('baytmart_admin_token'); setAdminToken(null) }}>Logout</button></div></div><div className="admin-content"><div className="catalog-head"><div><p className="eyebrow">Catalog</p><h2>{activeSection === 'Products' ? 'Products' : activeSection}</h2><p className="admin-subtitle">{activeSection === 'Products' ? 'Create, edit, publish, and organize your store catalog.' : 'This workspace is ready to connect to your store operations.'}</p></div><div className="admin-actions">{activeSection === 'Products' && <button className="button" onClick={() => setEditing({ ...blankProduct })}>+ New product</button>}</div></div>
    {activeSection !== 'Products' && <AdminModules section={activeSection} products={products} setNotice={setNotice} api={api} />}
    {activeSection === 'Products' && <div className="admin-product-tools"><form className="import-box" onSubmit={importProduct}><div><p className="eyebrow">Fast listing</p><h3>Import from a product link</h3><p>Laravel fetches page metadata and calculates a 40% markup.</p></div><input type="url" required value={importForm.url} onChange={(event) => setImportForm({ ...importForm, url: event.target.value })} placeholder="https://example.com/product" /><div className="inline-fields"><input required value={importForm.category} onChange={(event) => setImportForm({ ...importForm, category: event.target.value })} placeholder="Category" /><input type="number" min="0" value={importForm.stock} onChange={(event) => setImportForm({ ...importForm, stock: event.target.value })} placeholder="Stock" /><button className="button">Import product</button></div></form>
    {editing && <form className="product-editor" onSubmit={saveProduct}><div className="editor-heading"><div><p className="eyebrow">{editing.id ? 'Edit product' : 'New product'}</p><h3>Product settings</h3></div><button type="button" className="close-editor" onClick={() => setEditing(null)}>×</button></div><div className="editor-grid"><label>Title<input required value={editing.title} onChange={(event) => updateField('title', event.target.value)} /></label><label>SKU<input value={editing.sku || ''} onChange={(event) => updateField('sku', event.target.value)} placeholder="Auto-generated if empty" /></label><label>Brand<input value={editing.brand || ''} onChange={(event) => updateField('brand', event.target.value)} /></label><label>Category<input required value={editing.category} onChange={(event) => updateField('category', event.target.value)} /></label><label className="wide">Description<textarea rows="5" value={editing.description || ''} onChange={(event) => updateField('description', event.target.value)} /></label><label className="wide">Main image URL<input type="url" value={editing.image_url || ''} onChange={(event) => updateField('image_url', event.target.value)} /></label><label>Source price<input type="number" step="0.01" min="0" value={editing.source_price} onChange={(event) => updateField('source_price', event.target.value)} /></label><label>Sale price<input required type="number" step="0.01" min="0" value={editing.price} onChange={(event) => updateField('price', event.target.value)} /></label><label>Compare-at price<input type="number" step="0.01" min="0" value={editing.compare_at_price || ''} onChange={(event) => updateField('compare_at_price', event.target.value)} placeholder="Original price" /></label><label>Stock<input type="number" min="0" value={editing.stock} onChange={(event) => updateField('stock', event.target.value)} /></label><label>Weight<input type="number" step="0.01" min="0" value={editing.weight || ''} onChange={(event) => updateField('weight', event.target.value)} placeholder="kg" /></label><label className="wide">Tags<input value={editing.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="desk, wireless, new" /></label></div><div className="editor-section"><div className="section-heading"><div><p className="eyebrow">Options</p><h4>Product options</h4></div><button type="button" className="small-action" onClick={addOption}>+ Add option</button></div>{editing.options.map((option, index) => <div className="option-row" key={index}><input placeholder="Option name e.g. Color" value={option.name} onChange={(event) => updateOption(index, 'name', event.target.value)} /><input placeholder="Values e.g. Black, White" value={(option.values || []).join(', ')} onChange={(event) => updateOption(index, 'values', parseList(event.target.value))} /></div>)}</div><div className="editor-section"><div className="section-heading"><div><p className="eyebrow">Variants</p><h4>Sell different configurations</h4></div><button type="button" className="small-action" onClick={addVariant}>+ Add variant</button></div>{editing.variants.map((variant, index) => <div className="variant-row" key={index}><input placeholder="Variant name" value={variant.title} onChange={(event) => updateVariant(index, 'title', event.target.value)} /><input placeholder="SKU" value={variant.sku || ''} onChange={(event) => updateVariant(index, 'sku', event.target.value)} /><input type="number" step="0.01" placeholder="Price" value={variant.price} onChange={(event) => updateVariant(index, 'price', Number(event.target.value))} /><input type="number" min="0" placeholder="Stock" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', Number(event.target.value))} /></div>)}</div><div className="editor-section"><div className="section-heading"><div><p className="eyebrow">Search preview</p><h4>SEO settings</h4></div></div><div className="editor-grid"><label>SEO title<input maxLength="70" value={editing.seo_title || ''} onChange={(event) => updateField('seo_title', event.target.value)} placeholder={editing.title || 'Product title'} /></label><label>SEO description<input maxLength="160" value={editing.seo_description || ''} onChange={(event) => updateField('seo_description', event.target.value)} placeholder="Short search result description" /></label></div></div><div className="toggle-grid"><label><input type="checkbox" checked={editing.is_active} onChange={(event) => updateField('is_active', event.target.checked)} /> Published on storefront</label><label><input type="checkbox" checked={editing.is_featured} onChange={(event) => updateField('is_featured', event.target.checked)} /> Featured product</label><label><input type="checkbox" checked={editing.track_inventory} onChange={(event) => updateField('track_inventory', event.target.checked)} /> Track inventory</label><label><input type="checkbox" checked={editing.allow_backorder} onChange={(event) => updateField('allow_backorder', event.target.checked)} /> Allow selling when out of stock</label></div><div className="editor-footer"><button type="button" className="button secondary" onClick={() => setEditing(null)}>Cancel</button><button className="button" disabled={saving}>{saving ? 'Saving...' : 'Save product'}</button></div></form>}
    <div className="admin-table"><div className="table-head"><span>Product</span><span>Pricing</span><span>Inventory</span><span>Actions</span></div>{products.map((product) => <div className="table-row" key={product.id}><span>{product.title}<small>{product.brand || product.category} · {product.sku || 'No SKU'}</small></span><span>{money(product.price)}{product.compare_at_price && <small className="was-price">{money(product.compare_at_price)}</small>}</span><span>{product.track_inventory ? `${product.stock} in stock` : 'Not tracked'}<small>{product.is_active ? 'Published' : 'Draft'}{product.is_featured ? ' · Featured' : ''}</small></span><span className="row-actions"><button onClick={() => editProduct(product)}>Edit</button><button onClick={() => removeProduct(product)}>Delete</button></span></div>)}</div>
    </div>}</div></div></section>
}