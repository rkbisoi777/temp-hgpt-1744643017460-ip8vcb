// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { ChatInterface } from '../components/ChatInterface';

// export function Chat() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const initialQuery = location.state?.initialQuery;

//   useEffect(() => {
//     if (!initialQuery) {
//       navigate('/');
//     }
//   }, [initialQuery, navigate]);

//   return (
//     <div className="flex flex-col h-[calc(100vh-64px)]">
//       <ChatInterface initialQuery={initialQuery} />
//     </div>
//   );
// }

// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { ChatInterface } from '../components/ChatInterface';
// import { History, PanelLeft, X } from 'lucide-react';
// import { ChatHistory } from '../components/chat/ChatHistory';
// import { useAuthStore } from '../store/authStore';

// export function Chat() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const initialQuery = location.state?.initialQuery;
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const { user } = useAuthStore();

//   useEffect(() => {
//     if (!initialQuery) {
//       navigate('/');
//     }
//   }, [initialQuery, navigate]);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className="flex h-[calc(100vh-64px)]">
//       {/* Chat History Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 z-30 w-80 bg-white transform ${
//           isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         } transition-transform duration-300 ease-in-out shadow-lg mt-16`}
//       >
//         <div className="h-full overflow-y-auto">
//           <div className="flex justify-between items-center p-4 border-b">
//             <h2 className="text-lg font-semibold">Chat History</h2>
//             <button
//               onClick={toggleSidebar}
//               className="p-1 hover:bg-gray-100 rounded-full"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//           <ChatHistory />
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 relative">
//         {user && (
//           <button
//             onClick={toggleSidebar}
//             className={`fixed left-1 top-[64px] z-20 p-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md shadow-md hover:bg-gray-50 transition-colors ${
//               isSidebarOpen ? 'hidden' : ''
//             }`}
//           >
//             <History className="w-5 h-5" />
//           </button>
//         )}
//         <ChatInterface initialQuery={initialQuery} />
//       </div>

//       {/* Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-20 mt-16"
//           onClick={toggleSidebar}
//         />
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatInterface } from '../components/ChatInterface';
import { History, X, PlusCircle } from 'lucide-react';
import { ChatHistory } from '../components/chat/ChatHistory';
import { ChatHistoryService } from '../lib/chatHistoryService';
import { useAuthStore } from '../store/authStore';

export function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = location.state?.initialQuery;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  // const user = useAuthStore((state) => state.user);

  // useEffect(() => {
  //   if (!initialQuery) {
  //     navigate('/');
  //   }
  // }, [initialQuery, navigate]);

  useEffect(() => {
    if (initialQuery === undefined) return; // Prevent unnecessary runs
    if (!initialQuery) {
      navigate('/');
    }
  }, [initialQuery, navigate]);
  
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to handle creating a new chat
  const handleNewChat = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    try {
      // Create a new chat in the database
      const newChat = await ChatHistoryService.createChat(user.id, 'New Chat');
      console.log('New chat created:', newChat);

      // Navigate to the new chat
      navigate(`/chat/${newChat.id}`, { state: { initialQuery: '' } });
    } catch (error:any) {
      console.error('Error creating new chat:', error.message);
    }
  };

  const ChatInterfaceMemoized = React.memo(ChatInterface);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Chat History Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 bg-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out shadow-lg mt-16`}
      >
        <div className="h-full overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ChatHistory />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 relative">
        {user && (
          <>
            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className={`fixed left-1 top-[64px] z-20 p-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md shadow-md hover:bg-gray-50 transition-colors ${
                isSidebarOpen ? 'hidden' : ''
              }`}
            >
              <History className="w-5 h-5" />
            </button>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="fixed right-4 bottom-4 z-20 p-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </>
        )}
        
        <ChatInterfaceMemoized initialQuery={initialQuery} />
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 mt-16"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}