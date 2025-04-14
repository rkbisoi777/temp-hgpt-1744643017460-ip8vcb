import { useState, useEffect } from 'react';
import { ChatHistory as ChatHistoryType, ChatHistoryService } from '../../lib/chatHistoryService';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, Trash2, Edit2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function ChatHistory() {
  const [chats, setChats] = useState<ChatHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    loadChatHistory();
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    try {
      const history = await ChatHistoryService.getChatHistory(user.id);
      setChats(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chatId: string) => {
    try {
      await ChatHistoryService.deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleEdit = (chat: ChatHistoryType) => {
    setEditingId(chat.id);
    setNewTitle(chat.title);
  };

  const handleSave = async (chatId: string) => {
    try {
      await ChatHistoryService.updateChatTitle(chatId, newTitle);
      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));
      setEditingId(null);
      toast.success('Chat title updated');
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast.error('Failed to update chat title');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-4" />
        <p>No chat history yet</p>
        <p className="text-sm">Start a new chat to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {chats.map(chat => (
        // <div
        //   key={chat.id}
        //   className="bg-white rounded-lg border border-gray-100 hover:border-blue-500 transition-colors"
        // >
        //   <div className="p-3">
        //     <div className="flex items-center justify-between mb-2">
        //       {editingId === chat.id ? (
        //         <div className="flex-1 mr-2">
        //           <input
        //             type="text"
        //             value={newTitle}
        //             onChange={(e) => setNewTitle(e.target.value)}
        //             className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        //             autoFocus
        //           />
        //         </div>
        //       ) : (
        //         <h3 className="font-medium text-gray-900 flex-1 text-sm">{chat.title}</h3>
        //       )}
              
        //       <div className="flex items-center gap-1">
        //         {editingId === chat.id ? (
        //           <button
        //             onClick={() => handleSave(chat.id)}
        //             className="text-green-500 hover:text-green-600 text-sm"
        //           >
        //             Save
        //           </button>
        //         ) : (
        //           <>
        //             <button
        //               onClick={() => handleEdit(chat)}
        //               className="text-gray-400 hover:text-gray-600 p-1"
        //             >
        //               <Edit2 className="w-3.5 h-3.5" />
        //             </button>
        //             <button
        //               onClick={() => handleDelete(chat.id)}
        //               className="text-gray-400 hover:text-red-500 p-1"
        //             >
        //               <Trash2 className="w-3.5 h-3.5" />
        //             </button>
        //           </>
        //         )}
        //       </div>
        //     </div>
            
        //     <div className="flex items-center text-xs text-gray-500">
        //       <Clock className="w-3.5 h-3.5 mr-1" />
        //       <span>{formatDate(chat.updated_at)}</span>
        //     </div>
        //   </div>
        // </div>
        <Link to={`/chat/${chat.id}`}>
  <div
    key={chat.id}
    className="bg-white rounded-lg border border-gray-100 hover:border-blue-500 transition-colors cursor-pointer"
  >
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        {editingId === chat.id ? (
          <div className="flex-1 mr-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        ) : (
          <h3 className="font-medium text-gray-900 flex-1 text-sm">{chat.title}</h3>
        )}
        <div className="flex items-center gap-1">
          {editingId === chat.id ? (
            <button
              onClick={(e) => {
                e.preventDefault(); // prevent link navigation
                handleSave(chat.id);
              }}
              className="text-green-500 hover:text-green-600 text-sm"
            >
              Save
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleEdit(chat);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(chat.id);
                }}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-500">
        <Clock className="w-3.5 h-3.5 mr-1" />
        <span>{formatDate(chat.updated_at)}</span>
      </div>
    </div>
  </div>
</Link>

      ))}
    </div>
  );
}