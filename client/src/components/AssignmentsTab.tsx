import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Code, Upload, CheckCircle, Loader2, Star, Users } from 'lucide-react';
import { useToast } from '../components/Toast';
import CodeEditor from './CodeEditor';

interface AssignmentsTabProps {
  courseId: string;
}

export default function AssignmentsTab({ courseId }: AssignmentsTabProps) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  // State for active assignment view
  const [activeAssignment, setActiveAssignment] = useState<any | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for peer review
  const [peerSubmissions, setPeerSubmissions] = useState<any[]>([]);
  const [reviewingSubmission, setReviewingSubmission] = useState<any | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewGrade, setReviewGrade] = useState<number>(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // State for creating assignment
  const [isCreating, setIsCreating] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    type: 'text',
    points: 100
  });
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  useEffect(() => {
    if (!courseId || !user) return;

    const fetchAssignmentsAndSubmissions = async () => {
      setLoading(true);
      try {
        // Fetch assignments
        const assignmentsQuery = query(collection(db, 'assignments'), where('courseId', '==', courseId));
        const assignmentsSnap = await getDocs(assignmentsQuery);
        const assignmentsData = assignmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAssignments(assignmentsData);

        // Fetch user's submissions
        const submissionsQuery = query(
          collection(db, 'submissions'), 
          where('courseId', '==', courseId),
          where('userId', '==', user.uid)
        );
        const submissionsSnap = await getDocs(submissionsQuery);
        const submissionsData: Record<string, any> = {};
        submissionsSnap.docs.forEach(d => {
          const data = d.data();
          submissionsData[data.assignmentId] = { id: d.id, ...data };
        });
        setSubmissions(submissionsData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'assignments/submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentsAndSubmissions();
  }, [courseId, user]);

  const handleSubmitAssignment = async () => {
    if (!activeAssignment || !user) return;
    setIsSubmitting(true);
    try {
      const submissionData = {
        assignmentId: activeAssignment.id,
        courseId,
        userId: user.uid,
        content: submissionContent,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'submissions'), submissionData);
      setSubmissions(prev => ({
        ...prev,
        [activeAssignment.id]: { id: docRef.id, ...submissionData }
      }));
      showToast('Assignment submitted successfully', 'success');
      setActiveAssignment(null);
      setSubmissionContent('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
      showToast('Failed to submit assignment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPeerSubmissions = async (assignmentId: string) => {
    try {
      // In a real app, you'd want a more complex query to avoid giving the user their own submission
      // or submissions they've already reviewed. For simplicity, we fetch all for this assignment
      // and filter client-side.
      const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId));
      const snap = await getDocs(q);
      const peers = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter(s => s.userId !== user?.uid); // Exclude own submission
      
      setPeerSubmissions(peers);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewingSubmission || !user || !activeAssignment) return;
    setIsSubmittingReview(true);
    try {
      // Add peer review
      await addDoc(collection(db, 'peerReviews'), {
        submissionId: reviewingSubmission.id,
        assignmentId: activeAssignment.id,
        reviewerId: user.uid,
        grade: reviewGrade,
        feedback: reviewFeedback,
        createdAt: new Date().toISOString()
      });

      // Update submission status if needed (e.g., average grade)
      // For simplicity, we just mark it as reviewed if it wasn't
      if (reviewingSubmission.status !== 'reviewed') {
        await updateDoc(doc(db, 'submissions', reviewingSubmission.id), {
          status: 'reviewed',
          grade: reviewGrade // In a real app, this would be an average of multiple reviews
        });
      }

      showToast('Review submitted successfully', 'success');
      setReviewingSubmission(null);
      setReviewFeedback('');
      setReviewGrade(0);
      // Reload peer submissions
      loadPeerSubmissions(activeAssignment.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'peerReviews');
      showToast('Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.description) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    setIsSavingAssignment(true);
    try {
      const assignmentData = {
        ...newAssignment,
        courseId,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'assignments'), assignmentData);
      setAssignments(prev => [{ id: docRef.id, ...assignmentData }, ...prev]);
      showToast('Assignment created successfully', 'success');
      setIsCreating(false);
      setNewAssignment({ title: '', description: '', type: 'text', points: 100 });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assignments');
      showToast('Failed to create assignment', 'error');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (activeAssignment) {
    const isReviewMode = activeAssignment.mode === 'review';
    
    if (isReviewMode) {
      return (
        <div className="space-y-6">
          <button 
            onClick={() => { setActiveAssignment(null); setReviewingSubmission(null); }}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            &larr; Back to Assignments
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Peer Review: {activeAssignment.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{activeAssignment.description}</p>
            
            {!reviewingSubmission ? (
              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Submissions Needing Review</h3>
                {peerSubmissions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No peer submissions available for review right now.</p>
                ) : (
                  <div className="space-y-4">
                    {peerSubmissions.map((sub, idx) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <span className="font-medium dark:text-white">Student Submission #{idx + 1}</span>
                        <button 
                          onClick={() => setReviewingSubmission(sub)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Student's Work</h4>
                  {activeAssignment.type === 'code' ? (
                    <CodeEditor value={reviewingSubmission.content} onChange={() => {}} readOnly={true} language="javascript" />
                  ) : (
                    <div className="whitespace-pre-wrap dark:text-gray-300">{reviewingSubmission.content}</div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade (0-{activeAssignment.points || 100})</label>
                    <input 
                      type="number" 
                      min="0" 
                      max={activeAssignment.points || 100}
                      value={reviewGrade}
                      onChange={(e) => setReviewGrade(Number(e.target.value))}
                      className="w-full md:w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Constructive Feedback</label>
                    <textarea 
                      rows={4}
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Provide helpful feedback to your peer..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setReviewingSubmission(null)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || !reviewFeedback}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                    >
                      {isSubmittingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Submission Mode
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActiveAssignment(null)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          &larr; Back to Assignments
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeAssignment.title}</h2>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm font-medium rounded-full">
              {activeAssignment.points || 100} Points
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{activeAssignment.description}</p>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Your Submission</h3>
            {activeAssignment.type === 'code' ? (
              <CodeEditor 
                value={submissionContent} 
                onChange={setSubmissionContent} 
                language="javascript" 
              />
            ) : activeAssignment.type === 'file' ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">File upload simulation (use text for now)</p>
                <textarea 
                  rows={3}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Paste a link to your file here..."
                  className="mt-4 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            ) : (
              <textarea 
                rows={8}
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
            
            <div className="flex justify-end">
              <button 
                onClick={handleSubmitAssignment}
                disabled={isSubmitting || !submissionContent.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Assignment</h3>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Build a React Component"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the task..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select 
                    value={newAssignment.type}
                    onChange={e => setNewAssignment({...newAssignment, type: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="text">Open-ended Text</option>
                    <option value="code">Coding Exercise</option>
                    <option value="file">File Submission</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newAssignment.points}
                    onChange={e => setNewAssignment({...newAssignment, points: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50">
              <button 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateAssignment}
                disabled={isSavingAssignment}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {isSavingAssignment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
        {(profile?.role === 'teacher' || profile?.role === 'admin') && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            + Create Assignment
          </button>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No assignments yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Check back later for new exercises.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map(assignment => {
            const submission = submissions[assignment.id];
            const isSubmitted = !!submission;
            const isReviewed = submission?.status === 'reviewed';

            return (
              <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${assignment.type === 'code' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                      {assignment.type === 'code' ? <Code className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{assignment.title}</h3>
                  </div>
                  {isSubmitted && (
                    <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Submitted
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow line-clamp-2">
                  {assignment.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-amber-500" />
                    {isReviewed ? `${submission.grade}/${assignment.points || 100}` : `${assignment.points || 100} pts`}
                  </div>
                  
                  <div className="flex space-x-2">
                    {isSubmitted ? (
                      <button 
                        onClick={() => {
                          setActiveAssignment({ ...assignment, mode: 'review' });
                          loadPeerSubmissions(assignment.id);
                        }}
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 flex items-center"
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        Review Peers
                      </button>
                    ) : (
                      <button 
                        onClick={() => setActiveAssignment(assignment)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                      >
                        Start Assignment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
