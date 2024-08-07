import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import {connected, disconnected, setQuestion, setTeacherStatus, setUser, addMessage, setPollCount, setUsersOnline, setKicked} from '../slices/socketSlice';

const socketMiddleware: Middleware = (store) => {
    let socket: Socket;

    return next => action => {
        switch (action.type) {
            case 'socket/connect':
                socket = io(process.env.BE_URL||'http://localhost:5001',{
                    query: { tabID: action.payload }
                });

                socket.on('connect', () => {
                    store.dispatch(connected(action.payload));
                });

                socket.on('disconnect', () => {
                    store.dispatch(disconnected());
                });

                socket.on('set-user', (obj: any) => {
                    store.dispatch(setUser(obj));
                });

                socket.on('teacher-status', (status:boolean) => {
                    store.dispatch(setTeacherStatus(status));
                });

                socket.on('current-poll', (question:any) => {
                    store.dispatch(setQuestion(question));
                });

                socket.on('chat-message', (message: any) => {
                    store.dispatch(addMessage(message));
                });

                socket.on('users-online-updated', (users: any[]) => {
                    store.dispatch(setUsersOnline(users));
                });

                socket.on('poll-count-updated', (count: number) => {
                    store.dispatch(setPollCount(count));
                });

                socket.on('kicked', () => {
                    store.dispatch(setKicked());
                });

                break;

            case 'teacher-signup':
                if (socket) {
                    socket.emit('teacher-signup')
                }
                break;

            case 'student-signup':
                if (socket) {
                    socket.emit('student-signup')
                }
                break;

            case 'save-student-name':
                if (socket) {
                    socket.emit('save-student-name', action.payload)
                }
                break;

            case 'socket/disconnect':
                if (socket) socket.disconnect();
                break;

            case 'answer-poll':
                if(socket) socket.emit('answer-poll', action.payload)
                break;

            case 'set-poll':
                store.dispatch(setQuestion(action.payload));
                break;

            case 'set-teacher-status':
                store.dispatch(setTeacherStatus(action.payload));
                break;

            case 'create-poll':
                if (socket) {
                    socket.emit('create-poll', action.payload);
                }
                break;

            case 'reset-poll':
                if (socket) {
                    socket.emit('reset-poll');
                }
                break;

            case 'send-message':
                if (socket) {
                    socket.emit('send-message', action.payload);
                }
                break;

            case 'kick-student':
                if (socket) {
                    socket.emit('kick-student', action.payload);
                }
                break;

            default:
                return next(action);
        }

        return next(action);
    };
};

export default socketMiddleware;
