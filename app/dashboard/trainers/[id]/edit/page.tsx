'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function TrainerEditPage({ params }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Employee',
    charge_per_hour: 0,
    contact_number: '',
    phone: '',
    email: '',
    address: '',
    gov_id_number: ''
  })

  useEffect(() => {
    // Fetch trainer data
    const fetchTrainer = async () => {
      try {
        setIsLoading(true)
        // For testing, just set loading false after a delay
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
        
        // In real implementation, you'd fetch data:
        // const token = localStorage.getItem('token')
        // const response = await axios.get(`http://localhost:8000/trainers/${params.id}`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // })
        // setFormData(response.data)
      } catch (error) {
        console.error('Error fetching trainer:', error)
        setIsLoading(false)
      }
    }
    
    fetchTrainer()
  }, [params.id])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // In real implementation, you'd update the data:
    // const token = localStorage.getItem('token')
    // await axios.put(`http://localhost:8000/trainers/${params.id}`, formData, {
    //   headers: { 
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
    
    // Go back to trainers page
    router.push('/dashboard/trainers')
  }
  
  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Trainer</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="Employee">Employee</option>
            <option value="Freelancer">Freelancer</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-1">Hourly Rate (KD)</label>
          <input
            type="number"
            name="charge_per_hour"
            value={formData.charge_per_hour}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Contact Number</label>
          <input
            type="text"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Gov ID Number</label>
          <input
            type="text"
            name="gov_id_number"
            value={formData.gov_id_number}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Trainer
          </button>
        </div>
      </form>
    </div>
  )
}