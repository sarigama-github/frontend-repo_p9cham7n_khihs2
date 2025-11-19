import { useEffect, useMemo, useState } from 'react'
import { api } from './lib/api'

function Stat({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="text-sm text-blue-200/80">{label}</div>
      <div className="text-2xl font-semibold text-white mt-1">{value}</div>
    </div>
  )
}

function Section({ title, children, right }) {
  return (
    <section className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={
        'w-full px-3 py-2 rounded-md bg-slate-900/60 border border-white/10 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
        (props.className || '')
      }
    />
  )
}

function Select(props) {
  return (
    <select
      {...props}
      className={'w-full px-3 py-2 rounded-md bg-slate-900/60 border border-white/10 text-white focus:outline-none ' + (props.className || '')}
    >
      {props.children}
    </select>
  )
}

function Table({ columns, data, empty = 'No records' }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/60 text-blue-200">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {data.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-blue-200/70" colSpan={columns.length}>{empty}</td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5">
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2 text-blue-50/90">
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function Navbar({ tab, setTab }) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'customers', label: 'Customers' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'factfind', label: 'Factfinding' },
    { key: 'settings', label: 'Settings' },
    { key: 'storefront', label: 'Storefront' },
  ]
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`px-3 py-1.5 rounded-md border text-sm transition ${
            tab === t.key
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900/60 text-blue-200/90 border-white/10 hover:bg-white/10'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  useEffect(() => {
    api.analyticsSummary().then(setSummary).catch(() => setSummary(null))
  }, [])
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Stat label="Customers" value={summary?.customers ?? '—'} />
      <Stat label="Orders" value={summary?.orders ?? '—'} />
      <Stat label="Revenue" value={summary ? `$${summary.revenue.toFixed(2)}` : '—'} />
      <Section title="Top Products">
        <ul className="space-y-2">
          {(summary?.top_products || []).map((p, i) => (
            <li key={i} className="text-blue-50/90">{p.product_id} • qty {p.quantity}</li>
          ))}
          {(!summary || (summary.top_products || []).length === 0) && (
            <li className="text-blue-200/70">No data yet</li>
          )}
        </ul>
      </Section>
    </div>
  )
}

function Customers() {
  const empty = { name: '', email: '', phone: '', address: '', notes: '', status: 'active' }
  const [form, setForm] = useState(empty)
  const [rows, setRows] = useState([])
  const load = async () => setRows(await api.listCustomers())
  useEffect(() => { load() }, [])
  const submit = async (e) => {
    e.preventDefault()
    await api.createCustomer(form)
    setForm(empty)
    await load()
  }
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Section title="Add Customer">
        <form onSubmit={submit} className="space-y-3">
          <TextInput placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
          <TextInput placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
          <TextInput placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
          <TextInput placeholder="Address" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} />
          <TextInput placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} />
          <Select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>
            <option value="active">Active</option>
            <option value="lead">Lead</option>
            <option value="archived">Archived</option>
          </Select>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2">Save</button>
        </form>
      </Section>
      <div className="md:col-span-2">
        <Section title="Customers">
          <Table
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'phone', header: 'Phone' },
              { key: 'status', header: 'Status' },
            ]}
            data={rows}
          />
        </Section>
      </div>
    </div>
  )
}

function Products() {
  const empty = { title: '', description: '', price: 0, category: 'service', in_stock: true }
  const [form, setForm] = useState(empty)
  const [rows, setRows] = useState([])
  const load = async () => setRows(await api.listProducts())
  useEffect(() => { load() }, [])
  const submit = async (e) => {
    e.preventDefault()
    await api.createProduct({ ...form, price: Number(form.price) })
    setForm(empty)
    await load()
  }
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Section title="Add Service">
        <form onSubmit={submit} className="space-y-3">
          <TextInput placeholder="Name" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
          <TextInput placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
          <TextInput placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} />
          <Select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
            <option value="service">Service</option>
            <option value="add-on">Add-on</option>
            <option value="package">Package</option>
          </Select>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2">Save</button>
        </form>
      </Section>
      <div className="md:col-span-2">
        <Section title="Services">
          <Table
            columns={[
              { key: 'title', header: 'Name' },
              { key: 'price', header: 'Price', render: (v)=> `$${Number(v).toFixed(2)}` },
              { key: 'category', header: 'Category' },
              { key: 'in_stock', header: 'Active', render: (v)=> v ? 'Yes' : 'No' },
            ]}
            data={rows}
          />
        </Section>
      </div>
    </div>
  )
}

function Orders() {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ customer_id: '', items: [], total: 0, status: 'pending', notes: '' })

  const recalcTotal = (items) => items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0)

  useEffect(() => {
    api.listCustomers().then(setCustomers)
    api.listProducts().then(setProducts)
    api.listOrders().then(setRows)
  }, [])

  const addItem = () => {
    if (!products[0]) return
    const p = products[0]
    const next = [...form.items, { product_id: p.id, quantity: 1, price: p.price }]
    setForm({ ...form, items: next, total: recalcTotal(next) })
  }

  const submit = async (e) => {
    e.preventDefault()
    await api.createOrder({ ...form, total: recalcTotal(form.items) })
    setForm({ customer_id: '', items: [], total: 0, status: 'pending', notes: '' })
    setRows(await api.listOrders())
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Section title="Create Order" right={<button onClick={addItem} className="px-3 py-1.5 bg-white/10 text-blue-100 rounded-md">Add Item</button>}>
        <form onSubmit={submit} className="space-y-3">
          <Select value={form.customer_id} onChange={(e)=>setForm({...form,customer_id:e.target.value})}>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="space-y-2">
            {form.items.map((it, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Select value={it.product_id} onChange={(e)=>{
                  const p = products.find(x=>x.id===e.target.value)
                  const next = form.items.map((row,i)=> i===idx ? { ...row, product_id: e.target.value, price: p?.price ?? row.price } : row)
                  setForm({ ...form, items: next, total: recalcTotal(next) })
                }} className="flex-1">
                  {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </Select>
                <TextInput type="number" min={1} value={it.quantity} onChange={(e)=>{
                  const next = form.items.map((row,i)=> i===idx ? { ...row, quantity: Number(e.target.value) } : row)
                  setForm({ ...form, items: next, total: recalcTotal(next) })
                }} className="w-20" />
                <div className="text-blue-100 w-20 text-right">${Number(it.price).toFixed(2)}</div>
              </div>
            ))}
            {form.items.length === 0 && <div className="text-blue-200/70 text-sm">Add at least one item</div>}
          </div>
          <div className="text-right text-white font-semibold">Total: ${recalcTotal(form.items).toFixed(2)}</div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2">Save Order</button>
        </form>
      </Section>
      <div className="md:col-span-2">
        <Section title="Orders">
          <Table
            columns={[
              { key: 'id', header: 'Order #' },
              { key: 'customer_id', header: 'Customer' },
              { key: 'total', header: 'Total', render:(v)=> `$${Number(v).toFixed(2)}` },
              { key: 'status', header: 'Status' },
            ]}
            data={rows}
          />
        </Section>
      </div>
    </div>
  )
}

function FactFinding() {
  const [customers, setCustomers] = useState([])
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ customer_id: '', responses: {}, stage: 'new' })
  useEffect(() => {
    api.listCustomers().then(setCustomers)
    api.listFactFinds().then(setRows)
  }, [])
  const addQA = () => {
    const k = prompt('Question')
    if (!k) return
    const v = prompt('Answer') || ''
    setForm({ ...form, responses: { ...form.responses, [k]: v } })
  }
  const submit = async (e) => {
    e.preventDefault()
    await api.createFactFind(form)
    setRows(await api.listFactFinds())
    setForm({ customer_id: '', responses: {}, stage: 'new' })
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Section title="New Factfind" right={<button onClick={addQA} className="px-3 py-1.5 bg-white/10 text-blue-100 rounded-md">Add Q&A</button>}>
        <form onSubmit={submit} className="space-y-3">
          <Select value={form.customer_id} onChange={(e)=>setForm({...form,customer_id:e.target.value})}>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="bg-slate-900/60 p-3 rounded-md border border-white/10 text-blue-100 text-sm space-y-2">
            {Object.entries(form.responses).length === 0 && <div className="text-blue-200/70">No questions added</div>}
            {Object.entries(form.responses).map(([q,a]) => (
              <div key={q}>
                <div className="text-blue-300">Q: {q}</div>
                <div className="">A: {a}</div>
              </div>
            ))}
          </div>
          <Select value={form.stage} onChange={(e)=>setForm({...form,stage:e.target.value})}>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2">Save</button>
        </form>
      </Section>
      <Section title="History">
        <Table
          columns={[
            { key: 'customer_id', header: 'Customer' },
            { key: 'stage', header: 'Stage' },
            { key: 'id', header: 'ID' },
          ]}
          data={rows}
        />
      </Section>
    </div>
  )
}

function SettingsPage() {
  const [form, setForm] = useState({ company_name: '', contact_email: '', currency: 'USD', tax_rate: 0 })
  useEffect(() => { api.getSettings().then(setForm) }, [])
  const submit = async (e) => { e.preventDefault(); await api.updateSettings({ ...form, tax_rate: Number(form.tax_rate) }) }
  return (
    <div className="max-w-lg">
      <Section title="Settings">
        <form onSubmit={submit} className="space-y-3">
          <TextInput placeholder="Company name" value={form.company_name || ''} onChange={(e)=>setForm({...form,company_name:e.target.value})} />
          <TextInput placeholder="Contact email" type="email" value={form.contact_email || ''} onChange={(e)=>setForm({...form,contact_email:e.target.value})} />
          <TextInput placeholder="Currency (e.g., USD)" value={form.currency || ''} onChange={(e)=>setForm({...form,currency:e.target.value})} />
          <TextInput placeholder="Tax rate (0-1)" type="number" step="0.01" value={form.tax_rate ?? 0} onChange={(e)=>setForm({...form,tax_rate:e.target.value})} />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2">Save</button>
        </form>
      </Section>
    </div>
  )
}

function Storefront() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const total = useMemo(() => cart.reduce((s, it)=> s + it.price*it.qty, 0), [cart])
  useEffect(() => { api.listProducts().then(setProducts) }, [])
  const add = (p) => {
    setCart((c)=>{
      const ex = c.find(x=>x.id===p.id)
      if (ex) return c.map(x=> x.id===p.id ? { ...x, qty: x.qty+1 } : x)
      return [...c, { id: p.id, title: p.title, price: Number(p.price), qty: 1 }]
    })
  }
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Section title="Services for Sale">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-white font-semibold">{p.title}</div>
                <div className="text-blue-200 text-sm mt-1">{p.description}</div>
                <div className="text-white mt-2">${Number(p.price).toFixed(2)}</div>
                <button onClick={()=>add(p)} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1.5">Add</button>
              </div>
            ))}
          </div>
        </Section>
      </div>
      <div>
        <Section title="Cart">
          <div className="space-y-2">
            {cart.length === 0 && <div className="text-blue-200/70 text-sm">Your cart is empty</div>}
            {cart.map((it)=> (
              <div key={it.id} className="flex items-center justify-between text-blue-100">
                <div>{it.title} × {it.qty}</div>
                <div>${(it.price*it.qty).toFixed(2)}</div>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 flex items-center justify-between text-white font-semibold">
              <div>Total</div>
              <div>${total.toFixed(2)}</div>
            </div>
            <button disabled className="w-full bg-slate-700 text-white rounded-md py-1.5 opacity-70 cursor-not-allowed">Checkout (demo)</button>
          </div>
        </Section>
      </div>
    </div>
  )
}

function App() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="relative min-h-screen p-6 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Legal Services CRM</h1>
            <p className="text-blue-200/80 text-sm">Manage customers, products, orders, factfinding, and analytics. Public storefront included.</p>
          </div>
          <Navbar tab={tab} setTab={setTab} />
        </header>

        {tab === 'dashboard' && <Dashboard />}
        {tab === 'customers' && <Customers />}
        {tab === 'products' && <Products />}
        {tab === 'orders' && <Orders />}
        {tab === 'factfind' && <FactFinding />}
        {tab === 'settings' && <SettingsPage />}
        {tab === 'storefront' && <Storefront />}

        <footer className="mt-10 text-center text-blue-300/60 text-sm">
          Powered by Flames Blue • Backend: {api.baseUrl}
        </footer>
      </div>
    </div>
  )
}

export default App
