import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DomainApi from '../../api/DomainApi';
import { IoMdAdd, IoMdTrash, IoMdCreate } from 'react-icons/io';
import { ButtonLoader } from '../../components/Loading';

export default function DomainManager() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'customer', 'carrier'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add domain form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState({
    domain: '',
    type: 'customer',
    description: ''
  });
  const [addLoading, setAddLoading] = useState(false);

  // Edit domain state
  const [editingDomain, setEditingDomain] = useState(null);
  const [editForm, setEditForm] = useState({
    domain: '',
    type: 'customer',
    description: '',
    isActive: true
  });

  // Load domains on component mount and when filter changes
  useEffect(() => {
    fetchDomains();
  }, [filter, searchTerm]);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const filterType = filter === 'all' ? null : filter;
      const search = searchTerm.trim() || null;
      const response = await DomainApi.getAllDomains(filterType, search);
      setDomains(response.domains || []);
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      toast.error('Failed to load domains');
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.domain.trim()) {
      toast.error('Domain is required');
      return;
    }

    setAddLoading(true);
    try {
      await DomainApi.addDomain(
        newDomain.domain.trim(),
        newDomain.type,
        newDomain.description.trim()
      );
      toast.success('Domain added successfully');
      setNewDomain({ domain: '', type: 'customer', description: '' });
      setShowAddForm(false);
      fetchDomains();
    } catch (error) {
      console.error('Failed to add domain:', error);
      toast.error(error.message || 'Failed to add domain');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditDomain = (domain) => {
    setEditingDomain(domain._id);
    setEditForm({
      domain: domain.domain,
      type: domain.type,
      description: domain.description || '',
      isActive: domain.isActive
    });
  };

  const handleUpdateDomain = async (e) => {
    e.preventDefault();
    if (!editForm.domain.trim()) {
      toast.error('Domain is required');
      return;
    }

    setAddLoading(true);
    try {
      await DomainApi.updateDomain(editingDomain, editForm);
      toast.success('Domain updated successfully');
      setEditingDomain(null);
      fetchDomains();
    } catch (error) {
      console.error('Failed to update domain:', error);
      toast.error(error.message || 'Failed to update domain');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteDomain = async (domainId) => {
    if (!window.confirm('Are you sure you want to delete this domain?')) {
      return;
    }

    try {
      await DomainApi.deleteDomain(domainId);
      toast.success('Domain deleted successfully');
      fetchDomains();
    } catch (error) {
      console.error('Failed to delete domain:', error);
      toast.error(error.message || 'Failed to delete domain');
    }
  };

  const handleToggleStatus = async (domainId) => {
    try {
      await DomainApi.toggleDomainStatus(domainId);
      toast.success('Domain status updated');
      fetchDomains();
    } catch (error) {
      console.error('Failed to toggle domain status:', error);
      toast.error(error.message || 'Failed to update domain status');
    }
  };

  const initializeDefaults = async () => {
    try {
      await DomainApi.initializeDefaultDomains();
      toast.success('Default domains initialized');
      fetchDomains();
    } catch (error) {
      console.error('Failed to initialize default domains:', error);
      toast.error(error.message || 'Failed to initialize default domains');
    }
  };

  const filteredDomains = domains.filter(domain => {
    if (filter !== 'all' && domain.type !== filter) return false;
    if (searchTerm && !domain.domain.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Domain Management</h1>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={initializeDefaults}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              Initialize Defaults
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center"
            >
              <IoMdAdd className="mr-1" size={16}/>
              Add Domain
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {['all', 'customer', 'carrier'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                  filter === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <input
            type="text"
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Add Domain Form */}
        {showAddForm && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Domain</h3>
            <form onSubmit={handleAddDomain} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Domain (e.g., company.com)"
                value={newDomain.domain}
                onChange={(e) => setNewDomain({...newDomain, domain: e.target.value})}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                required
              />
              
              <select
                value={newDomain.type}
                onChange={(e) => setNewDomain({...newDomain, type: e.target.value})}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="customer">Customer</option>
                <option value="carrier">Carrier</option>
              </select>
              
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDomain.description}
                onChange={(e) => setNewDomain({...newDomain, description: e.target.value})}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              />
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {addLoading && <ButtonLoader size="sm" color="white" />}
                  <span className="ml-1">Add</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Domains List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <ButtonLoader size="lg" />
              <p className="mt-2 text-gray-400">Loading domains...</p>
            </div>
          ) : filteredDomains.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No domains found</p>
              {filter !== 'all' && (
                <p className="text-sm mt-1">Try changing the filter or adding a new domain</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Domain</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredDomains.map((domain) => (
                    <tr key={domain._id} className="hover:bg-gray-750">
                      <td className="px-4 py-3">
                        {editingDomain === domain._id ? (
                          <input
                            type="text"
                            value={editForm.domain}
                            onChange={(e) => setEditForm({...editForm, domain: e.target.value})}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <span className="font-mono">@{domain.domain}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingDomain === domain._id ? (
                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="customer">Customer</option>
                            <option value="carrier">Carrier</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs ${
                            domain.type === 'customer' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-orange-600 text-white'
                          }`}>
                            {domain.type}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingDomain === domain._id ? (
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Description"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {domain.description || 'No description'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingDomain === domain._id ? (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                              className="mr-2"
                            />
                            Active
                          </label>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(domain._id)}
                            className={`px-2 py-1 rounded text-xs ${
                              domain.isActive 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {domain.isActive ? 'Active' : 'Inactive'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(domain.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {editingDomain === domain._id ? (
                            <>
                              <button
                                onClick={handleUpdateDomain}
                                disabled={addLoading}
                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingDomain(null)}
                                className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditDomain(domain)}
                                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit domain"
                              >
                                <IoMdCreate size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteDomain(domain._id)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                title="Delete domain"
                              >
                                <IoMdTrash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && domains.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {domains.filter(d => d.type === 'customer').length}
              </div>
              <div className="text-sm text-gray-400">Customer Domains</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {domains.filter(d => d.type === 'carrier').length}
              </div>
              <div className="text-sm text-gray-400">Carrier Domains</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {domains.filter(d => d.isActive).length}
              </div>
              <div className="text-sm text-gray-400">Active Domains</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
