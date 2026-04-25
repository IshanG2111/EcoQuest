import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuizQuestion {
    question_text: string;
    options: string[];
    correct_index: number;
    explanation?: string;
    question_order: number;
}

export interface IQuiz extends Document {
    title: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description?: string;
    learning_material?: string;
    points_value: number;
    is_published: boolean;
    created_by: mongoose.Types.ObjectId;
    quiz_questions: IQuizQuestion[];
    createdAt: Date;
    updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
    question_text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correct_index: { type: Number, required: true },
    explanation: { type: String },
    question_order: { type: Number, required: true },
});

const QuizSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        topic: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true,
        },
        description: { type: String },
        learning_material: { type: String },
        points_value: { type: Number, default: 100 },
        is_published: { type: Boolean, default: false },
        created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        quiz_questions: [QuizQuestionSchema],
    },
    { timestamps: true }
);

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

export default Quiz;
