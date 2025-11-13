import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import ApexCharts from 'apexcharts';
import TrixEditor from '@/components/TrixEditor';
import AppLayout from "@/layouts/AppLayout";

export default function TodosIndex() {
  const { todos, statistics: statsFromServer, filters, flash } = usePage().props;
  const statistics = statsFromServer || {
    total: 0,
    completed: 0,
    in_progress: 0,
    pending: 0,
    high_priority: 0,
    medium_priority: 0,
    low_priority: 0,
  };

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [coverTodo, setCoverTodo] = useState(null);
  const [search, setSearch] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || '');
  const [priorityFilter, setPriorityFilter] = useState(filters?.priority || '');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    cover: null
  });

  // Show flash messages
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: flash.success,
        timer: 3000,
        showConfirmButton: false
      });
    }
  }, [flash]);

  // Render statistics chart
  useEffect(() => {
    renderStatusChart();
    renderPriorityChart();
    // destroy charts on unmount
    return () => {
      const sEl = document.querySelector("#statusChart");
      const pEl = document.querySelector("#priorityChart");
      if (sEl && sEl.apexChart) sEl.apexChart.destroy();
      if (pEl && pEl.apexChart) pEl.apexChart.destroy();
    };
  }, [statistics]);

  const renderStatusChart = () => {
    const options = {
      series: [statistics.pending, statistics.in_progress, statistics.completed],
      chart: {
        type: 'donut',
        height: 300
      },
      labels: ['Pending', 'In Progress', 'Completed'],
      colors: ['#fbbf24', '#3b82f6', '#10b981'],
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' }
        }
      }]
    };

    const chartElement = document.querySelector("#statusChart");
    if (chartElement) {
      chartElement.innerHTML = '';
      const chart = new ApexCharts(chartElement, options);
      chart.render();
      // keep a reference so we can destroy later
      chartElement.apexChart = chart;
    }
  };

  const renderPriorityChart = () => {
    const options = {
      series: [{
        name: 'Tasks',
        data: [statistics.low_priority, statistics.medium_priority, statistics.high_priority]
      }],
      chart: { type: 'bar', height: 300 },
      plotOptions: {
        bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' },
      },
      dataLabels: { enabled: false },
      xaxis: { categories: ['Low', 'Medium', 'High'] },
      colors: ['#10b981', '#3b82f6', '#ef4444'],
      fill: { opacity: 1 }
    };

    const chartElement = document.querySelector("#priorityChart");
    if (chartElement) {
      chartElement.innerHTML = '';
      const chart = new ApexCharts(chartElement, options);
      chart.render();
      chartElement.apexChart = chart;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      // append only when not null/empty for files and strings; allow false if needed
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    router.post('/todos', data, {
      onSuccess: () => {
        setShowModal(false);
        resetForm();
      },
      onError: () => {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menyimpan data',
        });
      }
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingTodo) return;
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) data.append(key, formData[key]);
    });

    router.post(`/todos/${editingTodo.id}?_method=PUT`, data, {
      forceFormData: true,
      onSuccess: () => {
        setShowEditModal(false);
        setEditingTodo(null);
        resetForm();
      }
    });
  };

  const handleUpdateCover = (e) => {
    e.preventDefault();
    if (!coverTodo) return;
    const data = new FormData();
    data.append('cover', formData.cover);

    router.post(`/todos/${coverTodo.id}/cover`, data, {
      forceFormData: true,
      onSuccess: () => {
        setShowCoverModal(false);
        setCoverTodo(null);
        resetForm();
      }
    });
  };

  const handleDelete = (todo) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(`/todos/${todo.id}?_method=DELETE`);
      }
    });
  };

  const handleSearch = () => {
    router.get('/todos', {
      search,
      status: statusFilter,
      priority: priorityFilter
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: '',
      cover: null
    });
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      status: todo.status,
      priority: todo.priority,
      due_date: todo.due_date || '',
      cover: null
    });
    setShowEditModal(true);
  };

  const openCoverModal = (todo) => {
    setCoverTodo(todo);
    setShowCoverModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return badges[status] || '';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800'
    };
    return badges[priority] || '';
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <Head title="Todos" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
            <p className="text-gray-600 mt-2">Manage your tasks and activities</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500">Total Tasks</div>
              <div className="text-3xl font-bold text-gray-900">{statistics.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-3xl font-bold text-green-600">{statistics.completed}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500">In Progress</div>
              <div className="text-3xl font-bold text-blue-600">{statistics.in_progress}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">{statistics.pending}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
              <div id="statusChart"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
              <div id="priorityChart"></div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search todos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Filter
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Todo
                </button>
              </div>
            </div>
          </div>

          {/* Todos List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cover</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(todos?.data ?? []).map((todo) => (
                    <tr key={todo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {todo.cover ? (
                          <img 
                            src={`/storage/${todo.cover}`} 
                            alt={todo.title}
                            className="w-16 h-16 object-cover rounded cursor-pointer"
                            onClick={() => openCoverModal(todo)}
                          />
                        ) : (
                          <div 
                            className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer"
                            onClick={() => openCoverModal(todo)}
                          >
                            <span className="text-gray-400 text-xs">No Cover</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{todo.title}</div>
                        {todo.description && (
                          <div 
                            className="text-sm text-gray-500 max-w-xs prose prose-sm"
                            dangerouslySetInnerHTML={{ __html: todo.description }}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(todo.status)}`}>
                          {todo.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {todo.due_date || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(todo)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(todo)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {Array.isArray(todos?.links) && todos.links.length > 0 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {todos.from ?? 0} to {todos.to ?? 0} of {todos.total ?? 0} results
                  </div>
                  <div className="flex gap-2">
                    {todos.links.map((link, index) => (
                      <button
                        key={index}
                        onClick={() => link.url && router.get(link.url)}
                        disabled={!link.url}
                        className={`px-3 py-1 rounded ${
                          link.active
                            ? 'bg-blue-600 text-white'
                            : link.url
                            ? 'bg-white text-gray-700 hover:bg-gray-50 border'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add / Edit / Cover modals (unchanged) */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Add New Todo</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <TrixEditor 
                        value={formData.description}
                        onChange={(content) => setFormData({...formData, description: content})}
                        placeholder="Enter todo description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, cover: e.target.files[0]})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Edit Todo</h2>
                <form onSubmit={handleUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <TrixEditor 
                        value={formData.description}
                        onChange={(content) => setFormData({...formData, description: content})}
                        placeholder="Enter todo description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingTodo(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showCoverModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Update Cover Image</h2>
                <form onSubmit={handleUpdateCover}>
                  <div className="space-y-4">
                    {coverTodo?.cover && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Current Cover:</p>
                        <img 
                          src={`/storage/${coverTodo.cover}`} 
                          alt="Current cover"
                          className="w-full h-48 object-cover rounded"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Cover Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, cover: e.target.files[0]})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCoverModal(false);
                        setCoverTodo(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}