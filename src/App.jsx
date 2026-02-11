import { useState, useEffect } from 'react'
import axios from 'axios'

// MAINTAINABILITY ISSUE: Unused variable
const unusedConstant = "I am not used";

function App() {
    const [products, setProducts] = useState([])
    const [user, setUser] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchProducts()
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5002/products')
            setProducts(response.data)
        } catch (error) {
            // RELIABILITY ISSUE: Poor error feedback to user
            console.error(error)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        // MAINTAINABILITY ISSUE: Console logs left in code
        console.log("Attempting login for:", username);

        try {
            const response = await axios.post('http://localhost:5001/login', { username, password })
            const userData = response.data.user
            setUser(userData)

            // SECURITY ISSUE: Storing sensitive information in localStorage
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('password', password) // VERY BAD

            setMessage('Login successful!')
        } catch (error) {
            setMessage('Login failed')
        }
    }

    const handleBuy = async (productId) => {
        if (!user) {
            alert("Please login first")
            return
        }

        try {
            const response = await axios.post('http://localhost:5003/transactions', {
                user_id: user.id,
                product_id: productId,
                quantity: 1
            })
            alert("Purchase successful! Total: $" + response.data.total_price)
            fetchProducts()
        } catch (error) {
            // RELIABILITY ISSUE: Unhandled promise rejection if alert is not enough
            alert("Purchase failed")
        }
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1 style={{ color: '#333' }}>Simple Marketplace</h1>

            {!user ? (
                <div style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '15px' }}>
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ display: 'block', marginBottom: '10px' }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ display: 'block', marginBottom: '10px' }}
                        />
                        <button type="submit">Login</button>
                    </form>
                    {message && <p>{message}</p>}
                </div>
            ) : (
                <div style={{ marginBottom: '40px' }}>
                    <p>Welcome, {user.username}! <button onClick={() => {
                        setUser(null)
                        localStorage.clear()
                    }}>Logout</button></p>
                </div>
            )}

            <h2>Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 120px 120px', gap: '20px' }}>
                {products.map(product => (
                    // RELIABILITY ISSUE: Missing 'key' prop in list mapping
                    <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>{product.name}</h3>
                        <p style={{ fontSize: '0.9em' }}>Price: ${product.price}</p>
                        <p style={{ fontSize: '0.9em' }}>Stock: {product.stock}</p>
                        <button
                            onClick={() => handleBuy(product.id)}
                            disabled={product.stock <= 0}
                            style={{ padding: '5px 10px', cursor: 'pointer' }}
                        >
                            Buy
                        </button>
                    </div>
                ))}
            </div>

            {/* MAINTAINABILITY ISSUE: Inline styles used extensively above instead of CSS classes */}
        </div>
    )
}

export default App
