import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuestionOption {
    id: number,
    fk_poll_question_id: number,
    option_text: string,
    is_correct: boolean,
    count: number
}

interface Question {
    id: string;
    question_text: string;
    options_db: QuestionOption[]
}

interface Answer {
    id: string;
    question_text: string;
    options_db: QuestionOption[]
}

interface SocketState {
    isConnected: boolean;
    isTeacherOnline: boolean;
    question: Question|null,
    answer: any|null,
    tabID: string | null,
    user_id: string | null;
    user_type: 'teacher' | 'student' | null;
}

const initialState: SocketState = {
    isConnected: false,
    isTeacherOnline: false,
    question: null,
    answer: null,
    tabID: null,
    user_id: null,
    user_type: null
};

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        connected: (state, action: PayloadAction<string>) => {
            state.isConnected = true;
            state.tabID = action.payload;
        },
        disconnected: (state) => {
            state.isConnected = false;
        },
        setUser: (state, action: PayloadAction<object>) => {
            state.user_type = action.payload?.user_type
            state.user_id = action.payload?.user_id
        },
        setTeacherStatus: (state, action: PayloadAction<boolean>) => {
            state.isTeacherOnline = action.payload
        },
        setQuestion: (state, action: PayloadAction<any>) => {
            state.question = action.payload?.question

            if(!state.user_id && !!action.payload?.answer){
                state.answer = action.payload?.answer
            }
            if(!action.payload?.answer){
                state.answer = null;
            }
            if(!!action.payload?.answer?.uuid && !!state.user_id && action.payload?.answer?.uuid === state.user_id){
                state.answer = action.payload?.answer
            }
        },
    },
});

export const { connected,
    disconnected,
    setUser,
    setTeacherStatus,
    setQuestion
} = socketSlice.actions;

export default socketSlice.reducer;
