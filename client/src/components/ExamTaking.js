import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';

const ExamTaking = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchExam();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (exam && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [exam, timeLeft]);

  const fetchExam = async () => {
    try {
      const data = await ApiService.getExam(id);
      setExam(data);
      setTimeLeft(data.duration * 60); // تحويل الدقائق إلى ثوان
      
      // تهيئة الإجابات
      const initialAnswers = {};
      data.questions.forEach(question => {
        initialAnswers[question._id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      toast.error('خطأ في جلب الامتحان');
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestion(index);
  };

  const handleAutoSubmit = async () => {
    toast.warning('انتهى الوقت! سيتم تسليم الامتحان تلقائياً');
    await submitExam();
  };

  const handleSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const submitExam = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const timeSpent = Math.floor((new Date() - startTime) / 1000);
      
      const result = await ApiService.submitExam(id, formattedAnswers, startTime.toISOString(), timeSpent);
      
      toast.success('تم تسليم الامتحان بنجاح!');
      
      // الانتقال لصفحة النتائج
      navigate(`/exams/${id}/result`, { 
        state: { 
          result: result.result,
          examTitle: exam.title 
        } 
      });
    } catch (error) {
      toast.error(error.message || 'خطأ في تسليم الامتحان');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer !== '').length;
  };

  const getTimeColor = () => {
    if (timeLeft > 300) return '#28a745'; // أخضر
    if (timeLeft > 60) return '#ffc107'; // أصفر
    return '#dc3545'; // أحمر
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>جاري تحميل الامتحان...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>الامتحان غير موجود</div>
        <button onClick={() => navigate('/exams')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          العودة للامتحانات
        </button>
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestion];

  return (
    <div>
      {/* شريط المعلومات العلوي */}
      <div className="card" style={{ 
        marginBottom: '2rem', 
        background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)', 
        color: 'white',
        position: 'sticky',
        top: '0',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{exam.title}</h2>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              السؤال {currentQuestion + 1} من {exam.questions.length}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: getTimeColor(),
              background: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px'
            }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              الوقت المتبقي
            </div>
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {getAnsweredCount()} / {exam.questions.length}
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              تم الإجابة
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* منطقة السؤال */}
        <div className="card">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #eee'
            }}>
              <h3 style={{ margin: 0, color: 'var(--gold)' }}>
                السؤال {currentQuestion + 1}
              </h3>
              <span style={{ 
                background: 'var(--gold)', 
                color: 'white', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '15px',
                fontSize: '0.9rem'
              }}>
                {currentQ.points} نقطة
              </span>
            </div>
            
            <div style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              {currentQ.question}
            </div>

            {/* خيارات الإجابة */}
            <div style={{ marginBottom: '2rem' }}>
              {currentQ.type === 'multiple_choice' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {currentQ.options.map((option, index) => (
                    <label 
                      key={index}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '1rem',
                        border: '2px solid #eee',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        backgroundColor: answers[currentQ._id] === option.text ? '#e3f2fd' : 'white',
                        borderColor: answers[currentQ._id] === option.text ? 'var(--gold)' : '#eee'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQ._id}`}
                        value={option.text}
                        checked={answers[currentQ._id] === option.text}
                        onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                        style={{ marginLeft: '1rem' }}
                      />
                      <span style={{ fontSize: '1rem' }}>{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.type === 'true_false' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {['true', 'false'].map((value) => (
                    <label 
                      key={value}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '1rem',
                        border: '2px solid #eee',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        backgroundColor: answers[currentQ._id] === value ? '#e3f2fd' : 'white',
                        borderColor: answers[currentQ._id] === value ? 'var(--gold)' : '#eee'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQ._id}`}
                        value={value}
                        checked={answers[currentQ._id] === value}
                        onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                        style={{ marginLeft: '1rem' }}
                      />
                      <span style={{ fontSize: '1rem' }}>
                        {value === 'true' ? '✅ صحيح' : '❌ خطأ'}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.type === 'essay' && (
                <textarea
                  className="form-control"
                  rows="6"
                  placeholder="اكتب إجابتك هنا..."
                  value={answers[currentQ._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                  style={{ fontSize: '1rem', lineHeight: '1.6' }}
                />
              )}
            </div>
          </div>

          {/* أزرار التنقل */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="btn btn-secondary"
            >
              ← السؤال السابق
            </button>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {currentQuestion === exam.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="btn btn-success"
                  style={{ padding: '0.75rem 2rem' }}
                >
                  تسليم الامتحان
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="btn btn-primary"
                >
                  السؤال التالي ←
                </button>
              )}
            </div>
          </div>
        </div>

        {/* لوحة التنقل */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '120px' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--gold)' }}>خريطة الأسئلة</h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {exam.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleQuestionJump(index)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: 
                    index === currentQuestion ? 'var(--gold)' :
                    answers[exam.questions[index]._id] ? '#28a745' : 'white',
                  color: 
                    index === currentQuestion ? 'white' :
                    answers[exam.questions[index]._id] ? 'white' : 'var(--text-secondary)',
                  borderColor:
                    index === currentQuestion ? 'var(--gold)' :
                    answers[exam.questions[index]._id] ? '#28a745' : '#ddd'
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: 'var(--gold)', 
                borderRadius: '4px',
                marginLeft: '0.5rem'
              }}></div>
              السؤال الحالي
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#28a745', 
                borderRadius: '4px',
                marginLeft: '0.5rem'
              }}></div>
              تم الإجابة
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: 'white', 
                border: '2px solid #ddd',
                borderRadius: '4px',
                marginLeft: '0.5rem'
              }}></div>
              لم تتم الإجابة
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-success"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            تسليم الامتحان
          </button>
        </div>
      </div>

      {/* نافذة تأكيد التسليم */}
      {showConfirmSubmit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', margin: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#dc3545' }}>تأكيد تسليم الامتحان</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p>هل أنت متأكد من تسليم الامتحان؟</p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                <div>الأسئلة المجاب عليها: {getAnsweredCount()} من {exam.questions.length}</div>
                <div>الوقت المتبقي: {formatTime(timeLeft)}</div>
                <div style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '0.5rem' }}>
                  لن تتمكن من العودة بعد التسليم!
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                إلغاء
              </button>
              <button
                onClick={submitExam}
                className="btn btn-danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري التسليم...' : 'تأكيد التسليم'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTaking;