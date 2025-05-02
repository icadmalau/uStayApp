import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/authContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.user?.role;
  const userId = user?.user?.id;

  const [housings, setHousings] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingHousing, setEditingHousing] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingStatusMap, setBookingStatusMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchHousings();
    if (role === 'mahasiswa') fetchStudentBookings();
    if (role === 'dosen') fetchLecturerBookings();
  }, [role, userId]);

  const fetchHousings = async () => {
    try {
      const endpoint = role === 'dosen'
        ? `/housing?ownerId=${userId}`
        : '/housing?available=true';
      const response = await api.get(endpoint);
      setHousings(response.data);
    } catch {
      setError('Failed to load housings');
    }
  };

  const handleUploadOrUpdate = async () => {
    const data = { title, description, location, available };
    try {
      if (editingHousing) {
        await api.patch(`/housing/${editingHousing.id}?ownerId=${userId}`, data);
        setSuccess('Housing updated!');
      } else {
        await api.post(`/housing?ownerId=${userId}`, data);
        setSuccess('Housing uploaded!');
      }
      resetForm();
      fetchHousings();
    } catch {
      setError(`Failed to ${editingHousing ? 'update' : 'upload'} housing`);
    }
  };

  const handleEdit = (housing: any) => {
    setEditingHousing(housing);
    setTitle(housing.title);
    setDescription(housing.description);
    setLocation(housing.location);
    setAvailable(housing.available);
  };

  const resetForm = () => {
    setEditingHousing(null);
    setTitle('');
    setDescription('');
    setLocation('');
    setAvailable(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/housing/${id}?ownerId=${userId}`);
      setSuccess('Housing deleted!');
      fetchHousings();
    } catch {
      setError('Failed to delete housing');
    }
  };

  const handleBooking = async (housingId: number) => {
    try {
      await api.post('/booking', { mahasiswaId: userId, housingId });
      setSuccess('Booking successful!');
      fetchStudentBookings();
    } catch {
      setError('Failed to book housing');
    }
  };

  const fetchStudentBookings = async () => {
    try {
      const response = await api.get(`/booking/mahasiswa/${userId}`);
      setBookings(response.data);
    } catch {
      setError('Failed to fetch mahasiswa bookings');
    }
  };

  const fetchLecturerBookings = async () => {
    try {
      const response = await api.get(`/booking/owner/${userId}`);
      setBookings(response.data);
      const initialStatusMap: { [key: number]: string } = {};
      response.data.forEach((booking: any) => {
        initialStatusMap[booking.id] = booking.status;
      });
      setBookingStatusMap(initialStatusMap);
    } catch {
      setError('Failed to fetch dosen bookings');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number) => {
    try {
      const status = bookingStatusMap[bookingId];
      await api.patch(`/booking/${bookingId}`, { status });
      setSuccess('Booking status updated!');
      fetchLecturerBookings();
    } catch {
      setError('Failed to update booking status');
    }
  };

  const handleChangeBookingStatus = (bookingId: number, newStatus: string) => {
    setBookingStatusMap((prev) => ({ ...prev, [bookingId]: newStatus }));
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/profile')}
        className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Profile
      </button>

      <h2 className="text-3xl font-bold mb-6">Welcome to uStay!</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      {/* Housing Cards */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Available Housings</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {housings.map((h: any) => (
            <div key={h.id} className="border p-4 rounded-lg shadow bg-white">
              <h4 className="text-xl font-bold">{h.title}</h4>
              <p className="text-gray-600">{h.location}</p>
              <p className="mt-1 text-sm">{h.description}</p>
              <div className="mt-3 flex gap-2">
                {role === 'mahasiswa' && (
                  <button
                    onClick={() => handleBooking(h.id)}
                    className="w-full py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Book
                  </button>
                )}
                {role === 'dosen' && (
                  <>
                    <button
                      onClick={() => handleEdit(h)}
                      className="w-full py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="w-full py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dosen: Housing Form */}
      {role === 'dosen' && (
        <div className="mb-12 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{editingHousing ? 'Edit Housing' : 'Add New Housing'}</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full border p-2 rounded"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={available}
                onChange={() => setAvailable(!available)}
              />
              Available
            </label>
            <div className="flex gap-4 mt-2">
              <button
                onClick={handleUploadOrUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {editingHousing ? 'Update' : 'Upload'}
              </button>
              {editingHousing && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* mahasiswa: Bookings */}
      {role === 'mahasiswa' && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Your Bookings</h3>
          <ul className="space-y-3">
            {bookings.map((b: any) => (
              <li key={b.id} className="border p-3 rounded bg-white shadow">
                <strong>{b.housing.title}</strong> — Status: <span className="italic">{b.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dosen: Booking Management */}
      {role === 'dosen' && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Bookings for Your Properties</h3>
          <ul className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((b: any) => (
                <li key={b.id} className="border p-4 rounded bg-white shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{b.mahasiswa.name}</strong> booked <em>{b.housing.title}</em> — Status: {b.status}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={bookingStatusMap[b.id] || b.status}
                        onChange={(e) => handleChangeBookingStatus(b.id, e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p>No bookings found</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
