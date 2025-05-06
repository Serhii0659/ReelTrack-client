import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Додаємо useNavigate для навігації
import Header from '../components/Header'; // Імпортуємо хедер

const initialFriendsList = [
  {
    id: 1,
    name: 'Марія',
    email: 'maria@example.com',
    avatar: 'https://i.pravatar.cc/150?u=alexey',
  },
  {
    id: 2,
    name: 'Олексій',
    email: 'alexey@example.com',
    avatar: 'https://i.pravatar.cc/150?u=maria',
  },
  {
    id: 3,
    name: 'Іван',
    email: 'ivan@example.com',
    avatar: 'https://i.pravatar.cc/150?u=ivan',
  },
];

const FriendsPage = () => {
  const [friendsList, setFriendsList] = useState(initialFriendsList);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showRemoveFriendModal, setShowRemoveFriendModal] = useState(false);
  const [newFriend, setNewFriend] = useState({ name: '', email: '' });
  const [friendToRemove, setFriendToRemove] = useState(null);

  const navigate = useNavigate(); // Для навігації

  const handleAddFriend = () => {
    const newFriendData = {
      id: friendsList.length + 1,
      name: newFriend.name,
      email: newFriend.email,
      avatar: `https://i.pravatar.cc/150?u=${newFriend.email}`,
    };
    setFriendsList([...friendsList, newFriendData]);
    setShowAddFriendModal(false);
    setNewFriend({ name: '', email: '' });
  };

  const confirmRemoveFriend = () => {
    if (friendToRemove) {
      setFriendsList(friendsList.filter((friend) => friend.id !== friendToRemove.id));
      setFriendToRemove(null);
      setShowRemoveFriendModal(false);
    }
  };

  const navigateToProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  return (
    <div className="bg-[#171717] min-h-screen text-white">
      {/* Додаємо хедер */}
      <Header />

      <div className="p-6">
        <h1 className="text-4xl font-bold text-center mb-20">Ваші Друзі</h1>
        <div className="max-w-4xl mx-auto mb-6 flex justify-between">
          <button
            onClick={() => setShowAddFriendModal(true)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Додати 
          </button>
          <button
            onClick={() => setShowRemoveFriendModal(true)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Видалити 
          </button>
        </div>
        <div className="max-w-4xl mx-auto">
          {friendsList.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center bg-[#272727] p-4 rounded-lg shadow-md mb-6"
            >
              <img
                src={friend.avatar}
                alt={`${friend.name}'s avatar`}
                className="w-16 h-16 rounded-full mr-6 cursor-pointer"
                onClick={() => navigateToProfile(friend.id)}
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">{friend.name}</h2>
                <p className="text-gray-400 text-sm">{friend.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальне вікно для додавання друга */}
      {showAddFriendModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#272727] p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-bold mb-4 text-center">Додати Друга</h2>
            <div className="mb-4">
              <label className="block text-[#979797] mb-2">Ім'я</label>
              <input
                type="text"
                value={newFriend.name}
                onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#171717] text-white focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Електронна Пошта</label>
              <input
                type="email"
                value={newFriend.email}
                onChange={(e) => setNewFriend({ ...newFriend, email: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#171717] text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowAddFriendModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Скасувати
              </button>
              <button
                onClick={handleAddFriend}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Додати
              </button>
            </div>
          </div>
        </div>
      )}

        {showRemoveFriendModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-[#1f1f1f] p-8 rounded-xl shadow-2xl w-96 relative">
            <h2 className="text-3xl font-extrabold text-center text-white mb-6">Видалити Друга</h2>
            <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-4">
                Оберіть Друга
                </label>
                <div className="flex flex-col space-y-3">
                {friendsList.map((friend) => (
                    <div
                    key={friend.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer bg-[#272727] hover:bg-[#3b3b3b] transition ${
                        friendToRemove?.id === friend.id ? "ring-2 ring-[#626366]" : ""
                    }`}
                    onClick={() => setFriendToRemove(friend)}
                    >
                    <img
                        src={friend.avatar}
                        alt={`${friend.name}'s avatar`}
                        className="w-10 h-10 rounded-full mr-4"
                    />
                    <div className="flex-1">
                        <p className="text-white font-semibold">{friend.name}</p>
                        <p className="text-[#979797] text-sm">{friend.email}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <button
                onClick={() => setShowRemoveFriendModal(false)}
                className="bg-[#626366]  hover:bg-gray-500 text-[#979797] font-bold py-2 px-6 rounded-lg transition"
                >
                Скасувати
                </button>
                <button
                onClick={confirmRemoveFriend}
                className={`py-2 px-6 rounded-lg font-bold transition ${
                    friendToRemove
                    ? "bg-[#626366]  hover:bg-gray-500 transition text-[#979797]"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                disabled={!friendToRemove}
                >
                Видалити
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default FriendsPage;