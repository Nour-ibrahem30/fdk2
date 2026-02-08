// 📝 كود إضافة امتحانات مدمجة في Dashboard
// انسخ هذا الكود وأضفه في dashboard.html

// ========================================
// 1. تحديث HTML modal إضافة الامتحان
// ========================================
// ابحث عن modal إضافة الامتحان واستبدله بهذا:

const examModalHTML = `
<form id="examForm">
    <div class="form-group">
        <label class="form-label">عنوان الامتحان</label>
        <input type="text" class="form-input" id="examTitle" required>
    </div>
    
    <div class="form-group">
        <label class="form-label">المدة (دقائق)</label>
        <input type="number" class="form-input" id="examDuration" min="0" placeholder="60" required>
    </div>
    
    <div class="form-group">
        <label class="form-label">الوصف</label>
        <textarea class="form-textarea" id="examDescription" rows="3" placeholder="وصف الامتحان"></textarea>
    </div>
    
    <div class="form-group">
        <label class="form-label">نوع الامتحان</label>
        <select class="form-select" id="examType" required>
            <option value="external">رابط خارجي (Google Forms)</option>
            <option value="internal">امتحان مدمج (داخل المنصة)</option>
        </select>
    </div>
    
    <!-- للامتحان الخارجي -->
    <div class="form-group" id="externalExamGroup">
        <label class="form-label">رابط الامتحان</label>
        <input type="url" class="form-input" id="examUrl" placeholder="https://forms.google.com/...">
        <p style="color: #94a3b8; font-size: 0.875rem; margin-top: 0.5rem;">يمكنك استخدام Google Forms أو أي منصة أخرى</p>
    </div>
    
    <!-- للامتحان المدمج -->
    <div class="form-group" id="internalExamGroup" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <label class="form-label" style="margin: 0;">الأسئلة</label>
            <button type="button" class="btn btn-sm btn-primary" id="addQuestionBtn">➕ إضافة سؤال</button>
        </div>
        <div id="questionsContainer" style="max-height: 400px; overflow-y: auto;"></div>
    </div>
</form>
`;

// ========================================
// 2. JavaScript للتحكم في نوع الامتحان
// ========================================

let questionCount = 0;
const questions = [];

// عند تغيير نوع الامتحان
document.getElementById('examType').addEventListener('change', function() {
    const isInternal = this.value === 'internal';
    document.getElementById('externalExamGroup').style.display = isInternal ? 'none' : 'block';
    document.getElementById('internalExamGroup').style.display = isInternal ? 'block' : 'none';
    
    // تحديث required
    document.getElementById('examUrl').required = !isInternal;
});

// إضافة سؤال جديد
document.getElementById('addQuestionBtn').addEventListener('click', function() {
    questionCount++;
    const questionHTML = `
        <div class="question-item" data-question-id="${questionCount}" style="background: rgba(15, 23, 42, 0.5); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid rgba(59, 130, 246, 0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="color: #3b82f6; margin: 0;">السؤال ${questionCount}</h4>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeQuestion(${questionCount})">🗑️</button>
            </div>
            
            <div class="form-group">
                <label class="form-label">نص السؤال</label>
                <textarea class="form-textarea" id="question_${questionCount}_text" rows="2" required></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">نوع السؤال</label>
                <select class="form-select" id="question_${questionCount}_type" onchange="updateQuestionOptions(${questionCount})">
                    <option value="true-false">صح أم خطأ</option>
                    <option value="mcq">اختيار من متعدد</option>
                </select>
            </div>
            
            <div id="question_${questionCount}_options"></div>
            
            <div class="form-group">
                <label class="form-label">الإجابة الصحيحة</label>
                <select class="form-select" id="question_${questionCount}_correct" required></select>
            </div>
            
            <div class="form-group">
                <label class="form-label">الشرح (اختياري)</label>
                <textarea class="form-textarea" id="question_${questionCount}_explanation" rows="2" placeholder="شرح الإجابة الصحيحة"></textarea>
            </div>
        </div>
    `;
    
    document.getElementById('questionsContainer').insertAdjacentHTML('beforeend', questionHTML);
    updateQuestionOptions(questionCount);
});

// تحديث خيارات السؤال
window.updateQuestionOptions = function(questionId) {
    const type = document.getElementById(`question_${questionId}_type`).value;
    const optionsContainer = document.getElementById(`question_${questionId}_options`);
    const correctSelect = document.getElementById(`question_${questionId}_correct`);
    
    if (type === 'true-false') {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label class="form-label">الخيارات</label>
                <input type="text" class="form-input" id="question_${questionId}_option_0" value="صح" readonly style="background: rgba(30, 41, 59, 0.5);">
                <input type="text" class="form-input" id="question_${questionId}_option_1" value="خطأ" readonly style="margin-top: 0.5rem; background: rgba(30, 41, 59, 0.5);">
            </div>
        `;
        correctSelect.innerHTML = `
            <option value="0">صح</option>
            <option value="1">خطأ</option>
        `;
    } else {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label class="form-label">الخيارات</label>
                <input type="text" class="form-input" id="question_${questionId}_option_0" placeholder="الخيار الأول" required>
                <input type="text" class="form-input" id="question_${questionId}_option_1" placeholder="الخيار الثاني" required style="margin-top: 0.5rem;">
                <input type="text" class="form-input" id="question_${questionId}_option_2" placeholder="الخيار الثالث" required style="margin-top: 0.5rem;">
                <input type="text" class="form-input" id="question_${questionId}_option_3" placeholder="الخيار الرابع" required style="margin-top: 0.5rem;">
            </div>
        `;
        correctSelect.innerHTML = `
            <option value="0">الخيار الأول</option>
            <option value="1">الخيار الثاني</option>
            <option value="2">الخيار الثالث</option>
            <option value="3">الخيار الرابع</option>
        `;
    }
};

// حذف سؤال
window.removeQuestion = function(questionId) {
    const questionEl = document.querySelector(`[data-question-id="${questionId}"]`);
    if (questionEl) {
        questionEl.remove();
        questionCount--;
    }
};

// ========================================
// 3. حفظ الامتحان
// ========================================

// في دالة حفظ الامتحان، استبدل الكود بهذا:
const examType = document.getElementById('examType').value;
const title = document.getElementById('examTitle').value.trim();
const duration = document.getElementById('examDuration').value;
const description = document.getElementById('examDescription').value.trim();

if (!title || !duration) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return false;
}

if (examType === 'external') {
    // امتحان خارجي
    const examUrl = document.getElementById('examUrl').value.trim();
    
    if (!examUrl) {
        showToast('يرجى إدخال رابط الامتحان', 'error');
        return false;
    }
    
    const newExam = {
        title,
        duration: parseInt(duration),
        description,
        examType: 'external',
        examUrl,
        createdAt: new Date().toISOString()
    };
    
    return addDoc(collection(db, 'exams'), newExam)
        .then((docRef) => {
            newExam.id = docRef.id;
            exams.push(newExam);
            renderExams();
            updateStats();
            showToast('تم إضافة الامتحان بنجاح!', 'success');
            return true;
        })
        .catch((error) => {
            console.error('Failed to save exam:', error);
            showToast('خطأ في حفظ الامتحان: ' + error.message, 'error');
            return false;
        });
        
} else {
    // امتحان مدمج
    const questionElements = document.querySelectorAll('.question-item');
    
    if (questionElements.length === 0) {
        showToast('يرجى إضافة سؤال واحد على الأقل', 'error');
        return false;
    }
    
    const questions = [];
    let hasError = false;
    
    questionElements.forEach((qEl) => {
        const qId = qEl.dataset.questionId;
        const questionText = document.getElementById(`question_${qId}_text`).value.trim();
        const type = document.getElementById(`question_${qId}_type`).value;
        const correctAnswer = parseInt(document.getElementById(`question_${qId}_correct`).value);
        const explanation = document.getElementById(`question_${qId}_explanation`).value.trim();
        
        if (!questionText) {
            showToast('يرجى ملء نص جميع الأسئلة', 'error');
            hasError = true;
            return;
        }
        
        const optionsCount = type === 'true-false' ? 2 : 4;
        const options = [];
        
        for (let i = 0; i < optionsCount; i++) {
            const optionEl = document.getElementById(`question_${qId}_option_${i}`);
            if (optionEl) {
                const optionValue = optionEl.value.trim();
                if (!optionValue && type !== 'true-false') {
                    showToast('يرجى ملء جميع الخيارات', 'error');
                    hasError = true;
                    return;
                }
                options.push(optionValue);
            }
        }
        
        questions.push({
            question: questionText,
            type: type,
            options: options,
            correctAnswer: correctAnswer,
            explanation: explanation
        });
    });
    
    if (hasError) return false;
    
    const newExam = {
        title,
        duration: parseInt(duration),
        description,
        examType: 'internal',
        questions: questions,
        createdAt: new Date().toISOString()
    };
    
    return addDoc(collection(db, 'exams'), newExam)
        .then((docRef) => {
            newExam.id = docRef.id;
            exams.push(newExam);
            renderExams();
            updateStats();
            showToast('تم إضافة الامتحان المدمج بنجاح!', 'success');
            console.log('Exam added with', questions.length, 'questions');
            return true;
        })
        .catch((error) => {
            console.error('Failed to save exam:', error);
            showToast('خطأ في حفظ الامتحان: ' + error.message, 'error');
            return false;
        });
}

// ========================================
// 4. CSS إضافي (اختياري)
// ========================================

const additionalCSS = `
<style>
.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.question-item {
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

#questionsContainer::-webkit-scrollbar {
    width: 8px;
}

#questionsContainer::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
    border-radius: 4px;
}

#questionsContainer::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 4px;
}

#questionsContainer::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.7);
}
</style>
`;

// ========================================
// ملاحظات مهمة:
// ========================================
// 1. تأكد من أن Firebase مُهيأ بشكل صحيح
// 2. تأكد من أن المتغيرات db, collection, addDoc متاحة
// 3. تأكد من أن دالة showToast موجودة
// 4. تأكد من أن دالة renderExams موجودة
// 5. تأكد من أن مصفوفة exams موجودة

console.log('✅ كود الامتحانات المدمجة جاهز!');
