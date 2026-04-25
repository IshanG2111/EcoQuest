import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuizAttempt extends Document {
    user_id: mongoose.Types.ObjectId;
    quiz_id: mongoose.Types.ObjectId;
    score: number;
    max_score: number;
    completed_at: Date;
}

const QuizAttemptSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
        score: { type: Number, required: true },
        max_score: { type: Number, required: true },
        completed_at: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const QuizAttempt: Model<IQuizAttempt> = mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

export default QuizAttempt;
