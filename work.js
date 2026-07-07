/* ==========================================================================
   AI WORK ASSISTANT MVC CONTROLLER (work.js) - Gems-style AI Agent System
   ========================================================================== */

// --------------------------------------------------------------------------
// 0. FALLBACK DATA (CORS-safe data when loading from file:// protocol)
// --------------------------------------------------------------------------
const FALLBACK_SYSTEM_PROMPTS = {
  "업무보고 Agent": "당신은 대기업 및 공공기관의 일일/주간 업무 보고서 작성을 지원하는 전문 비즈니스 비서 에이전트입니다. 사용자가 답변한 비가공 데이터를 활용하여 보고 일자, 작성자, 소속 부서를 체계적으로 정리하고, 오늘 수행한 업무를 직관적이고 격식 있는 개조식(Bullet-point) 문체로 다듬어 표(Table) 중심의 보고서를 완성합니다. 없는 사실이나 추측은 절대로 추가하지 마십시오.",
  "프로젝트 진행보고 Agent": "당신은 대규모 소프트웨어 및 시스템 구축 프로젝트 관리를 전문으로 하는 시니어 IT PM(Project Manager) 에이전트입니다. 프로젝트 명칭, 담당자, 진척도 및 단계를 입력받아 일정과 이슈 상태를 진단하고 임원 보고용 품질의 PM 보고서를 표 형식으로 정리합니다. 리스크와 해결 방향을 논리정연하게 작성하십시오.",
  "회의록 Agent": "당신은 대기업 비서실 소속의 전문 회의 속기 및 비즈니스 분석 에이전트입니다. 회의 주제, 안건, 결정사항, 참석자들을 정리하여 후속조치(Action Item)가 명확히 명시된 회의록을 작성합니다. 결정 사항과 액션 아이템은 담당자와 기한을 매핑한 격자형 표 구조로 문서화하십시오.",
  "결과보고 Agent": "당신은 기업의 전략기획팀 성과분석관 에이전트입니다. 프로젝트나 행사 결과를 분석하여 목표 대비 달성도, 정량적/정성적 성과, 성공 및 아쉬운 점을 도출해 냅니다. 전자결재 양식과 유사한 깔끔하고 격식 있는 보고서로 정렬하십시오.",
  "문제(이슈) 보고 Agent": "당신은 IT 장애 및 보안 인시던트 대응을 담당하는 전문 SRE(Site Reliability Engineer) 에이전트입니다. 발생한 문제의 일시, 현상, 영향 범위, 원인을 기술적으로 분석하고 긴급 조치 내역과 재발 방지책을 정리합니다. 하드웨어/소프트웨어 관점의 명확한 인시던트 보고서 구조를 작성하십시오.",
  "제안서 Agent": "당신은 정부 지원 사업 및 대기업 입찰 제안을 설계하는 전문 사업기획 컨설턴트 에이전트입니다. 신규 과제명, 제안 배경, 솔루션 내용, 소요 예산 및 마일스톤 일정을 설득력 있게 다듬어 정식 투자 제안서 양식의 문서를 생성합니다."
};

const FALLBACK_QUESTIONS = {
  "업무보고 Agent": [
    { "id": "date", "question": "보고일은 언제인가요? (예: 2026-07-07)", "type": "date" },
    { "id": "writer", "question": "작성자는 누구인가요?", "type": "text", "memoryKey": "writer" },
    { "id": "position", "question": "직급은 무엇인가요? (예: 사원, 대리, 과장)", "type": "text", "memoryKey": "position" },
    { "id": "department", "question": "소속 부서는 어디인가요?", "type": "text", "memoryKey": "department" },
    { "id": "company", "question": "회사명은 무엇인가요?", "type": "text", "memoryKey": "company" },
    { "id": "todayWork", "question": "오늘 수행한 업무를 구체적으로 입력해주세요.", "type": "textarea" },
    { "id": "progress", "question": "오늘 업무의 진행률(%)은 어느 정도인가요? (숫자만 입력)", "type": "text" },
    { "id": "tomorrowPlan", "question": "내일 예정된 업무 계획은 어떻게 되시나요?", "type": "textarea" },
    { "id": "issue", "question": "업무 중 발생한 이슈나 특이사항이 있나요? (없으면 '없음')", "type": "textarea" }
  ],
  "프로젝트 진행보고 Agent": [
    { "id": "projectName", "question": "프로젝트명을 입력해 주세요.", "type": "text" },
    { "id": "manager", "question": "프로젝트 담당자(PM)는 누구인가요?", "type": "text", "memoryKey": "writer" },
    { "id": "department", "question": "담당 부서는 어디인가요?", "type": "text", "memoryKey": "department" },
    { "id": "company", "question": "회사명은 무엇인가요?", "type": "text", "memoryKey": "company" },
    { "id": "phase", "question": "현재 진행 단계를 입력해 주세요. (예: 기획, 디자인, 개발, 테스트, 배포)", "type": "text" },
    { "id": "progress", "question": "전체 프로젝트 진행률(%)은 얼마인가요? (숫자만 입력)", "type": "text" },
    { "id": "milestones", "question": "이번 기간에 달성한 주요 마일스톤(이정표)은 무엇인가요?", "type": "textarea" },
    { "id": "issues", "question": "현재 직면한 주요 리스크나 이슈는 무엇인가요? (없으면 '없음')", "type": "textarea" },
    { "id": "actionPlan", "question": "리스크를 해결하기 위한 향후 대처 계획은 무엇인가요?", "type": "textarea" }
  ],
  "회의록 Agent": [
    { "id": "title", "question": "회의 주제는 무엇인가요?", "type": "text" },
    { "id": "date", "question": "회의가 진행된 일자는 언제인가요? (예: 2026-07-07)", "type": "date" },
    { "id": "attendees", "question": "회의 참석자 명단을 알려주세요. (쉼표로 구분)", "type": "text" },
    { "id": "writer", "question": "회의록을 정리하는 작성자는 누구인가요?", "type": "text", "memoryKey": "writer" },
    { "id": "department", "question": "회의 주관 부서는 어디인가요?", "type": "text", "memoryKey": "department" },
    { "id": "company", "question": "회사명은 무엇인가요?", "type": "text", "memoryKey": "company" },
    { "id": "agenda", "question": "회의의 주요 안건은 무엇이었나요?", "type": "textarea" },
    { "id": "decisions", "question": "회의를 통해 결정된 주요 결정 사항은 무엇인가요?", "type": "textarea" },
    { "id": "actions", "question": "향후 진행할 후속 조치(Action Item)와 담당자를 적어주세요.", "type": "textarea" }
  ],
  "결과보고 Agent": [
    { "id": "name", "question": "프로젝트 또는 행사명을 적어주세요.", "type": "text" },
    { "id": "period", "question": "수행 기간은 어떻게 되나요? (예: 2026.06.01 ~ 2026.06.30)", "type": "text" },
    { "id": "writer", "question": "결과 보고자는 누구인가요?", "type": "text", "memoryKey": "writer" },
    { "id": "department", "question": "소속 부서는 어디인가요?", "type": "text", "memoryKey": "department" },
    { "id": "company", "question": "회사명은 무엇인가요?", "type": "text", "memoryKey": "company" },
    { "id": "goals", "question": "당초 목표했던 주요 지표나 최종 목표는 무엇이었나요?", "type": "textarea" },
    { "id": "outcomes", "question": "실제 달성한 주요 성과는 무엇인가요?", "type": "textarea" },
    { "id": "pros", "question": "이번 프로젝트에서 잘된 점(성공 요인)은 무엇인가요?", "type": "textarea" },
    { "id": "cons", "question": "아쉬운 점이나 직면했던 한계는 무엇이었나요?", "type": "textarea" },
    { "id": "improvements", "question": "차기 프로젝트나 업무에 반영할 개선 대책은 무엇인가요?", "type": "textarea" }
  ],
  "문제(이슈) 보고 Agent": [
    { "id": "title", "question": "발생한 문제 또는 이슈 제목은 무엇인가요?", "type": "text" },
    { "id": "occurrenceDate", "question": "이슈가 발생한 구체적인 일시를 적어주세요. (예: 2026-07-07 10:30)", "type": "text" },
    { "id": "writer", "question": "장애 보고 담당자는 누구인가요?", "type": "text", "memoryKey": "writer" },
    { "id": "department", "question": "담당 기술 부서는 어디인가요?", "type": "text", "memoryKey": "department" },
    { "id": "company", "question": "회사명은 무엇인가요?", "type": "text", "memoryKey": "company" },
    { "id": "impact", "question": "이슈 현상과 시스템/서비스에 미친 영향 범위는 어디까지인가요?", "type": "textarea" },
    { "id": "cause", "question": "분석된 장애/문제의 원인은 무엇인가요?", "type": "textarea" },
    { "id": "actions", "question": "취해진 긴급 조치 내역과 향후 재발 방지 대책은 무엇인가요?", "type": "textarea" }
  ],
  "제안서 Agent": [
    { "id": "title", "question": "제안하고자 하는 과제명은 무엇인가요?", "type": "text" },
    { "id": "proposer", "question": "제안자(또는 부서)는 누구인가요?", "type": "text", "memoryKey": "writer" },
    { "id": "department", "question": "제안 부서는 어디인가요?", "type": "text", "memoryKey": "department" },
    { "id": "company", "question": "회사명은 무엇인가요?", "type": "text", "memoryKey": "company" },
    { "id": "background", "question": "제안의 배경 및 필요성을 적어주세요.", "type": "textarea" },
    { "id": "content", "question": "제안의 핵심 내용 및 구체적 실행 방안을 요약해 주세요.", "type": "textarea" },
    { "id": "effect", "question": "제안 도입 시 예상되는 기대 효과는 무엇인가요?", "type": "textarea" },
    { "id": "budget", "question": "예상되는 소요 예산과 투입 인력 리소스는 어느 정도인가요?", "type": "textarea" },
    { "id": "timeline", "question": "대략적인 추진 일정 계획은 어떻게 되나요?", "type": "textarea" }
  ]
};

const FALLBACK_PROMPTS = {
  "업무보고 Agent": "당신은 비즈니스 보고서 교정 전문가입니다. 아래 업무 내용을 바탕으로 경영진 보고용 일일 업무보고를 매우 전문적이고 깔끔한 비즈니스 톤앤매너로 작성해주세요.\n\n[보고 일자]: {{date}}\n[작성자]: {{writer}}\n[직급]: {{position}}\n[부서]: {{department}}\n[회사명]: {{company}}\n[금일 업무]:\n{{todayWork}}\n[진행률]: {{progress}}%\n[향후 계획]:\n{{tomorrowPlan}}\n[발생 이슈]:\n{{issue}}",
  "프로젝트 진행보고 Agent": "당신은 IT 전문 PM(Project Manager)입니다. 다음 프로젝트 진행 상황 데이터를 토대로 현재 일정 관리 및 리스크 진단 결과를 체계적인 보고서 문서로 컴파일해 주세요.\n\n[프로젝트명]: {{projectName}}\n[PM/담당자]: {{manager}}\n[부서]: {{department}}\n[회사명]: {{company}}\n[현재 단계]: {{phase}}\n[진행률]: {{progress}}%\n[달성 마일스톤]:\n{{milestones}}\n[리스크 사항]:\n{{issues}}\n[해결 계획]:\n{{actionPlan}}",
  "회의록 Agent": "당신은 전문 회의 서기 AI입니다. 다음 회의 요약본을 검토하여 공식 회의록 보고서로 포맷팅해 주세요. 결정 사항과 구체적인 액션 아이템은 주체와 기한이 돋보이도록 마크다운 표로 요약해 주십시오.\n\n[회의 주제]: {{title}}\n[회의 일시]: {{date}}\n[참석자]: {{attendees}}\n[회의록 작성자]: {{writer}}\n[주관 부서]: {{department}}\n[회사명]: {{company}}\n[주요 안건]:\n{{agenda}}\n[결정 사항]:\n{{decisions}}\n[후속 조치]:\n{{actions}}",
  "결과보고 Agent": "당신은 전략기획팀 성과 분석가입니다. 아래 실행 성과를 바탕으로 정량적 및 정성적 분석이 포함된 종합 결과보고서를 작성해주세요.\n\n[프로젝트/행사명]: {{name}}\n[수행 기간]: {{period}}\n[보고자]: {{writer}}\n[부서]: {{department}}\n[회사명]: {{company}}\n[당초 목표]:\n{{goals}}\n[실제 성과]:\n{{outcomes}}\n[잘된 점 (성공 요인)]:\n{{pros}}\n[아쉬운 점 (한계)]:\n{{cons}}\n[개선 사항]:\n{{improvements}}",
  "문제(이슈) 보고 Agent": "당신은 시스템 신뢰성 엔지니어(SRE) 장애대응 분석가입니다. 아래 발생 장애 데이터를 분석하여 SLA 요건과 근본 원인(Root Cause), 재발 방지책이 명시된 IT 장애 보고서를 작성해주세요.\n\n[장애명]: {{title}}\n[발생 일시]: {{occurrenceDate}}\n[보고자]: {{writer}}\n[부서]: {{department}}\n[회사명]: {{company}}\n[영향 범위]:\n{{impact}}\n[장애 원인]:\n{{cause}}\n[조치 및 대책]:\n{{actions}}",
  "제안서 Agent": "당신은 사내 혁신 및 신사업 추진 컨설턴트입니다. 다음 제안 개요를 임원진 설득을 위한 논리정연하고 매력적인 비즈니스 제안서 초안으로 개발해 주세요.\n\n[제안 과제명]: {{title}}\n[제안자/부서]: {{proposer}}\n[제안 부서]: {{department}}\n[회사명]: {{company}}\n[제안 배경]:\n{{background}}\n[제안 내용]:\n{{content}}\n[기대 효과]:\n{{effect}}\n[소요 예산]:\n{{budget}}\n[추진 일정]:\n{{timeline}}"
};

const FALLBACK_REPORTS = {
  "업무보고 Agent": "| **문서구분** | 일일 업무 보고서 | **보안등급** | 대외비 |\n|:---:|:---|:---:|:---|\n| **소속부서** | {{department}} | **작성자** | {{writer}} {{position}} |\n| **기안일자** | {{date}} | **회사명** | {{company}} |\n\n| **1. 금일 주요 업무 진행 실적 (진행률: {{progress}}%)** |\n|:---|\n| {{todayWork}} |\n\n| **2. 명일 업무 계획 및 마일스톤** |\n|:---|\n| {{tomorrowPlan}} |\n\n| **3. 특이사항 및 긴급 조치 요구사항** |\n|:---|\n| {{issue}} |",
  "프로젝트 진행보고 Agent": "| **문서구분** | 프로젝트 진행상황 보고서 | **보안등급** | 사내제한 |\n|:---:|:---|:---:|:---|\n| **프로젝트명** | {{projectName}} | **PM / 담당** | {{manager}} |\n| **담당부서** | {{department}} | **소속회사** | {{company}} |\n| **현재단계** | {{phase}} | **전체진행률** | {{progress}}% |\n\n| **1. 주요 달성 마일스톤 현황** |\n|:---|\n| {{milestones}} |\n\n| **2. 주요 리스크 및 장애 요인** |\n|:---|\n| {{issues}} |\n\n| **3. 리스크 완화 계획 및 대응 방안 (Action Plan)** |\n|:---|\n| {{actionPlan}} |",
  "회의록 Agent": "| **문서구분** | 공식 회의록 (Meeting Minutes) | **보안등급** | 일반 |\n|:---:|:---|:---:|:---|\n| **회의주제** | {{title}} | **회의일시** | {{date}} |\n| **주관부서** | {{department}} | **회사명** | {{company}} |\n| **참석인원** | {{attendees}} | **기록자** | {{writer}} |\n\n| **1. 주요 회의 안건 및 논의 사항** |\n|:---|\n| {{agenda}} |\n\n| **2. 최종 의사결정 사항 (Decisions)** |\n|:---|\n| {{decisions}} |\n\n| **3. 부서별 후속 조치 과제 (Action Items)** |\n|:---|\n| {{actions}} |",
  "결과보고 Agent": "| **문서구분** | 최종 결과 보고서 (Result Report) | **보안등급** | 대외비 |\n|:---:|:---|:---:|:---|\n| **사업 / 행사명** | {{name}} | **수행기간** | {{period}} |\n| **기안부서** | {{department}} | **보고자** | {{writer}} |\n| **소속회사** | {{company}} | **최종평가** | 상 (Goal Achieved) |\n\n| **1. 당초 추진 목표 및 추진 필요성** |\n|:---|\n| {{goals}} |\n\n| **2. 주요 정량적 / 정성적 성과 결과** |\n|:---|\n| {{outcomes}} |\n\n| **3. 프로젝트 종합 성찰 및 교훈 (Keep / Problem)** |\n|:---|\n| **잘된 점 (Keep):**\n{{pros}}\n\n**아쉬운 점 (Problem):**\n{{cons}} |\n\n| **4. 향후 차기 사업 개선 방향 (Try)** |\n|:---|\n| {{improvements}} |",
  "문제(이슈) 보고 Agent": "| **문서구분** | 기술 장애 / 문제 보고서 (Incident Report) | **보안등급** | 대외비 |\n|:---:|:---|:---:|:---|\n| **장애명** | {{title}} | **발생일시** | {{occurrenceDate}} |\n| **담당부서** | {{department}} | **보고담당** | {{writer}} |\n| **소속회사** | {{company}} | **장애등급** | Severity 1 (Critical) |\n\n| **1. 장애 현상 및 비즈니스 영향 범위** |\n|:---|\n| {{impact}} |\n\n| **2. 기술 원인 분석 (Root Cause Analysis)** |\n|:---|\n| {{cause}} |\n\n| **3. 임시 조치 사항 및 장기 재발 방지 대책** |\n|:---|\n| {{actions}} |",
  "제안서 Agent": "| **문서구분** | 신규 과제 기획 제안서 (Proposal) | **보안등급** | 사내제한 |\n|:---:|:---|:---:|:---|\n| **제안과제명** | {{title}} | **제안부서** | {{department}} |\n| **제안자** | {{proposer}} | **소속회사** | {{company}} |\n\n| **1. 제안 배경 및 필요성 (Pain Points)** |\n|:---|\n| {{background}} |\n\n| **2. 핵심 제안 내용 및 상세 실행 계획 (Solution)** |\n|:---|\n| {{content}} |\n\n| **3. 정성 / 정량적 기대 효과** |\n|:---|\n| {{effect}} |\n\n| **4. 소요 예산 및 리소스 계획** |\n|:---|\n| {{budget}} |\n\n| **5. 추진 마일스톤 및 로드맵** |\n|:---|\n| {{timeline}} |"
};

// --------------------------------------------------------------------------
// 1. MODEL (ReportModel)
// --------------------------------------------------------------------------
class ReportModel {
  constructor() {
    this.systemPrompts = {};
    this.questions = {};
    this.promptTemplates = {};
    this.reportTemplates = {};
    
    this.sessions = JSON.parse(localStorage.getItem('work_sessions_v4')) || [];
    this.currentSession = null;
    
    // Shared Memory across different reports
    this.globalMemory = JSON.parse(localStorage.getItem('work_global_memory')) || {};
  }

  // Load JSON configs asynchronously with Fallback
  async loadConfigurations() {
    try {
      const sRes = await fetch('systemPrompts.json');
      this.systemPrompts = await sRes.json();
    } catch (e) {
      console.warn("Could not fetch systemPrompts.json. Using fallback static prompts.");
      this.systemPrompts = FALLBACK_SYSTEM_PROMPTS;
    }

    try {
      const qRes = await fetch('questions.json');
      this.questions = await qRes.json();
    } catch (e) {
      console.warn("Could not fetch questions.json. Using fallback static questions.");
      this.questions = FALLBACK_QUESTIONS;
    }

    try {
      const pRes = await fetch('promptTemplates.json');
      this.promptTemplates = await pRes.json();
    } catch (e) {
      console.warn("Could not fetch promptTemplates.json. Using fallback static prompts.");
      this.promptTemplates = FALLBACK_PROMPTS;
    }

    try {
      const rRes = await fetch('reportTemplates.json');
      this.reportTemplates = await rRes.json();
    } catch (e) {
      console.warn("Could not fetch reportTemplates.json. Using fallback static reports.");
      this.reportTemplates = FALLBACK_REPORTS;
    }
  }

  // Create new session
  createSession(agentName) {
    const questions = this.questions[agentName] || [];
    const fieldsData = {};
    questions.forEach(q => {
      fieldsData[q.id] = '';
    });

    const newSession = {
      id: 'session_' + Date.now(),
      type: agentName,
      title: `${agentName.split(' ')[0]} (${new Date().toLocaleDateString()})`,
      data: fieldsData,
      currentQuestionIndex: 0,
      isFinished: false,
      isAiEditMode: false,
      messages: [] // holds message logs: {sender: 'bot'|'user', text: string}
    };

    this.sessions.unshift(newSession);
    this.currentSession = newSession;
    this.saveSessions();
    return newSession;
  }

  deleteSession(sessionId) {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    if (this.currentSession && this.currentSession.id === sessionId) {
      this.currentSession = null;
    }
    this.saveSessions();
  }

  saveSessions() {
    localStorage.setItem('work_sessions_v4', JSON.stringify(this.sessions));
  }

  saveGlobalMemory() {
    localStorage.setItem('work_global_memory', JSON.stringify(this.globalMemory));
  }

  getSession(id) {
    return this.sessions.find(s => s.id === id);
  }
}

// --------------------------------------------------------------------------
// 2. VIEW (ReportView)
// --------------------------------------------------------------------------
class ReportView {
  constructor() {
    // Chat components
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendChatBtn = document.getElementById('sendChatBtn');
    this.currentSessionTitle = document.getElementById('currentSessionTitle');
    this.reportSelectHeaderContainer = document.getElementById('reportSelectHeaderContainer');
    this.reportTypeSelect = document.getElementById('reportTypeSelect');
    this.chatSessionsList = document.getElementById('chatSessionsList');
    this.aiAgentsList = document.getElementById('aiAgentsList');
    this.newChatBtn = document.getElementById('newChatBtn');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.chatInputHelperTips = document.getElementById('chatInputHelperTips');

    // Right progress components
    this.progressBarFill = document.getElementById('progressBarFill');
    this.progressValText = document.getElementById('progressValText');
    this.progressAscii = document.getElementById('progressAscii');
    this.checklistTitle = document.getElementById('checklistTitle');
    this.checklistItemsList = document.getElementById('checklistItemsList');

    // Status bar
    this.statusMessage = document.getElementById('statusMessage');
    this.statusIndicator = document.getElementById('statusIndicator');
    this.autoSaveTime = document.getElementById('autoSaveTime');

    // Output Modals
    this.outputModal = document.getElementById('outputModal');
    this.closeOutputModal = document.getElementById('closeOutputModal');
    this.outputModalTitle = document.getElementById('outputModalTitle');
    this.outputModalSubtitle = document.getElementById('outputModalSubtitle');
    this.modalTextarea = document.getElementById('modalTextarea');
    this.modalMarkdownBody = document.getElementById('modalMarkdownBody');
    this.modalActionBtn = document.getElementById('modalActionBtn');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
  }

  // Render AI Agents selection sidebar list
  renderAgentsSidebar(agentKeys, onSelectAgent) {
    this.aiAgentsList.innerHTML = '';
    agentKeys.forEach(key => {
      const div = document.createElement('div');
      div.className = 'agent-item';
      
      const avatar = document.createElement('div');
      avatar.className = 'agent-avatar';
      avatar.textContent = '🤖';
      div.appendChild(avatar);
      
      const label = document.createElement('span');
      label.textContent = key;
      div.appendChild(label);
      
      div.addEventListener('click', () => onSelectAgent(key));
      this.aiAgentsList.appendChild(div);
    });
  }

  // Clear chat screen
  clearChat() {
    this.chatMessages.innerHTML = '';
  }

  // Append single bubble
  appendBubble(sender, text, animate = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'bot-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    bubble.appendChild(avatar);
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = this.formatMarkdown(text);
    bubble.appendChild(messageContent);
    
    this.chatMessages.appendChild(bubble);
    this.scrollToBottom();

    if (animate && sender === 'bot') {
      const fullHTML = messageContent.innerHTML;
      messageContent.innerHTML = '';
      this.typeHTML(messageContent, fullHTML, 0, () => {
        this.scrollToBottom();
      });
    }

    return bubble;
  }

  // Append action buttons inside chat bubble
  appendFinishActions(containerBubble) {
    // Check if actions wrapper is already present in this bubble
    if (containerBubble.querySelector('.report-finish-actions-container')) {
      return;
    }

    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'report-finish-actions-container';
    
    const buttons = [
      { text: '👀 보고서 보기', action: 'viewReport', class: 'primary-btn' },
      { text: '📋 프롬프트 보기', action: 'viewPrompt', class: 'primary-btn' },
      { text: '✏️ AI 수정 대화', action: 'aiEditMode', class: 'accent-btn' },
      { text: '📄 PDF 저장', action: 'savePdf' },
      { text: '📝 Word 저장', action: 'saveWord' },
      { text: '📁 Markdown 저장', action: 'saveMarkdown' },
      { text: '💾 복사', action: 'copyContent' }
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = `finish-action-btn ${btn.class || ''}`;
      button.textContent = btn.text;
      button.setAttribute('data-action', btn.action);
      actionsWrapper.appendChild(button);
    });

    const msgContent = containerBubble.querySelector('.message-content');
    msgContent.appendChild(actionsWrapper);
    this.scrollToBottom();
  }

  typeHTML(element, htmlString, index = 0, callback) {
    if (index < htmlString.length) {
      if (htmlString[index] === '<') {
        const endTagIndex = htmlString.indexOf('>', index);
        if (endTagIndex !== -1) {
          element.innerHTML += htmlString.substring(index, endTagIndex + 1);
          index = endTagIndex;
        }
      } else {
        element.innerHTML += htmlString[index];
      }
      this.scrollToBottom();
      setTimeout(() => {
        this.typeHTML(element, htmlString, index + 1, callback);
      }, 5);
    } else {
      if (callback) callback();
    }
  }

  // Highly advanced markdown table and text parser
  formatMarkdown(text) {
    if (!text) return '';
    let lines = text.split('\n');
    let formatted = [];
    let isTableOpen = false;
    
    lines.forEach(line => {
      let trimmed = line.trim();
      
      // 1. Markdown tables formatting
      if (trimmed.startsWith('|')) {
        // Skip table dividers |---|---|
        if (trimmed.includes('---')) {
          return;
        }
        if (!isTableOpen) {
          formatted.push('<table style="border-collapse: collapse; width: 100%; border: 1px solid var(--card-border); margin: 10px 0; background: rgba(0, 0, 0, 0.1);">');
          isTableOpen = true;
        }
        const cells = trimmed.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        const tag = trimmed.includes('**') ? 'th' : 'td';
        const cellStyle = tag === 'th' 
          ? 'border: 1px solid var(--card-border); padding: 8px 10px; background: rgba(0, 242, 254, 0.08); font-weight: bold; text-align: center;'
          : 'border: 1px solid var(--card-border); padding: 8px 10px;';
        
        formatted.push('<tr>' + cells.map(c => `<${tag} style="${cellStyle}">${c.replace(/\*\*([^*]+)\*\*/g, '$1')}</${tag}>`).join('') + '</tr>');
        return;
      }
      
      if (isTableOpen) {
        formatted.push('</table>');
        isTableOpen = false;
      }

      // 2. Titles & bullet points
      if (trimmed.startsWith('### ')) {
        formatted.push(`<h3 style="color:#00f2fe; margin-top: 1rem; margin-bottom: 0.5rem; font-family: var(--font-heading); font-size:1.15rem;">${trimmed.substring(4)}</h3>`);
      } else if (trimmed.startsWith('#### ')) {
        formatted.push(`<h4 style="color:var(--text-primary); margin-top: 0.8rem; margin-bottom: 0.4rem; font-family: var(--font-heading); font-size:0.95rem;">${trimmed.substring(5)}</h4>`);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        formatted.push(`<div style="margin-left: 1rem; margin-bottom: 0.25rem; text-indent: -0.8rem; padding-left: 0.8rem;">• ${trimmed.substring(2)}</div>`);
      } else {
        // bold formatting
        let lineHTML = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#00f2fe;">$1</strong>');
        formatted.push(lineHTML + '<br>');
      }
    });

    if (isTableOpen) {
      formatted.push('</table>');
    }

    return formatted.join('\n');
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  showTyping(show) {
    if (show) {
      this.typingIndicator.classList.add('active');
      this.scrollToBottom();
    } else {
      this.typingIndicator.classList.remove('active');
    }
  }

  toggleInputState(enabled) {
    this.chatInput.disabled = !enabled;
    this.sendChatBtn.disabled = !enabled;
    if (enabled) {
      this.chatInput.placeholder = "답변을 입력하세요... (Enter 전송 / Shift+Enter 줄바꿈)";
      this.chatInput.focus();
    } else {
      this.chatInput.placeholder = "보고서 대화를 시작해 주세요.";
    }
  }

  // Update Right Checklist Panel
  updateRightPanel(reportType, qList, data, currentIndex, isFinished) {
    if (!reportType) {
      this.progressBarFill.style.width = '0%';
      this.progressValText.textContent = '0%';
      this.progressAscii.textContent = '□□□□□□□□□□ 0 / 0';
      this.checklistTitle.textContent = '보고서 요약 카드';
      this.checklistItemsList.innerHTML = '<li class="checklist-placeholder-msg">AI Agent를 선택하면 작성 현황판이 활성화됩니다.</li>';
      return;
    }

    const total = qList.length;
    const filledCount = isFinished ? total : currentIndex;
    const pct = total > 0 ? Math.round((filledCount / total) * 100) : 0;

    // Progress Bar
    this.progressBarFill.style.width = `${pct}%`;
    this.progressValText.textContent = `${pct}%`;

    // Ascii progress
    const blocksFilled = Math.min(10, Math.round(pct / 10));
    const ascii = '■'.repeat(blocksFilled) + '□'.repeat(10 - blocksFilled);
    this.progressAscii.textContent = `${ascii} ${filledCount} / ${total}`;

    // Update Checklist Title
    this.checklistTitle.textContent = `${reportType.split(' ')[0]} 진행 카드`;

    // Populate checklist items
    this.checklistItemsList.innerHTML = '';
    qList.forEach((q, idx) => {
      const li = document.createElement('li');
      const isChecked = isFinished || idx < currentIndex;
      li.className = `checklist-item ${isChecked ? 'checked' : 'pending'}`;
      
      const checkIcon = document.createElement('span');
      checkIcon.className = 'check-icon';
      checkIcon.textContent = isChecked ? '✔' : '□';
      li.appendChild(checkIcon);

      const label = document.createElement('span');
      label.className = 'field-name-lbl';
      const cleanLabel = q.question.split('?')[0].split('(')[0].replace('은 언제인가요', '').replace('는 누구인가요', '').replace('을 알려주세요', '').trim();
      label.textContent = cleanLabel;
      li.appendChild(label);

      // Value Preview
      if (isChecked && data[q.id]) {
        const valSpan = document.createElement('span');
        valSpan.className = 'field-preview-val';
        valSpan.textContent = data[q.id];
        valSpan.title = data[q.id];
        li.appendChild(valSpan);
      }

      this.checklistItemsList.appendChild(li);
    });
  }

  // Update Left sidebar list
  renderSessionsSidebar(sessionsList, activeId, onClickItem, onDeleteItem) {
    this.chatSessionsList.innerHTML = '';
    if (sessionsList.length === 0) {
      this.chatSessionsList.innerHTML = '<div class="no-sessions">저장된 세션이 없습니다.</div>';
      return;
    }

    sessionsList.forEach(session => {
      const div = document.createElement('div');
      div.className = `session-item ${session.id === activeId ? 'active' : ''}`;
      
      const textSpan = document.createElement('span');
      textSpan.textContent = session.title;
      div.appendChild(textSpan);

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-session-btn';
      delBtn.innerHTML = '&times;';
      delBtn.title = '대화 삭제';
      
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onDeleteItem(session.id);
      });

      div.addEventListener('click', () => {
        onClickItem(session.id);
      });

      div.appendChild(delBtn);
      this.chatSessionsList.appendChild(div);
    });
  }

  updateStatusBar(state, text) {
    this.statusMessage.textContent = text;
    this.statusIndicator.className = 'status-indicator';
    if (state === 'active') {
      this.statusIndicator.classList.add('active');
    } else if (state === 'warning') {
      this.statusIndicator.classList.add('warning');
    }
  }

  showOutputModal(title, text, isMarkdown = false) {
    this.outputModalTitle.textContent = title;
    this.outputModal.classList.add('open');

    if (isMarkdown) {
      this.modalTextarea.style.display = 'none';
      this.modalMarkdownBody.style.display = 'block';
      this.modalMarkdownBody.innerHTML = this.formatMarkdown(text);
      this.modalActionBtn.style.display = 'none';
    } else {
      this.modalTextarea.style.display = 'block';
      this.modalMarkdownBody.style.display = 'none';
      this.modalTextarea.value = text;
      this.modalActionBtn.style.display = 'flex';
      this.modalActionBtn.querySelector('span').textContent = '텍스트 복사';
    }
  }

  closeModal() {
    this.outputModal.classList.remove('open');
  }
}

// --------------------------------------------------------------------------
// 3. CONTROLLER (ReportController)
// --------------------------------------------------------------------------
class ReportController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.isAiTyping = false;
    this.tempEditTargetId = null;

    this.init();
  }

  async init() {
    this.view.updateStatusBar('warning', 'AI Agent 구동 엔진 시동 중...');
    await this.model.loadConfigurations();
    
    // Gems-style dynamic Agent listing from json keys
    const agentList = Object.keys(this.model.systemPrompts);
    this.view.renderAgentsSidebar(agentList, (agentName) => this.startNewSession(agentName));

    this.view.updateStatusBar('active', 'AI Agent 플랫폼 준비 완료. 에이전트를 선택하세요.');

    this.bindEvents();
    this.renderSidebar();
    
    // Auto resume
    if (this.model.sessions.length > 0) {
      this.loadSession(this.model.sessions[0].id);
    }
  }

  bindEvents() {
    // Send message triggers
    this.view.sendChatBtn.addEventListener('click', () => this.handleSendMessage());

    this.view.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Modals
    this.view.closeOutputModal.addEventListener('click', () => this.view.closeModal());
    this.view.modalCloseBtn.addEventListener('click', () => this.view.closeModal());
    
    // Copy inside Modal
    this.view.modalActionBtn.addEventListener('click', () => {
      const copyVal = this.view.modalTextarea.value;
      navigator.clipboard.writeText(copyVal).then(() => {
        const btnText = this.view.modalActionBtn.querySelector('span');
        btnText.textContent = '복사 완료!';
        setTimeout(() => {
          btnText.textContent = '텍스트 복사';
        }, 1500);
      });
    });

    // Chat Event Delegation for Finish Actions
    this.view.chatMessages.addEventListener('click', (e) => {
      const target = e.target.closest('.finish-action-btn');
      if (target) {
        const action = target.getAttribute('data-action');
        this.handleFinishActions(action);
      }
    });

    // Chips Event
    this.view.chatInputHelperTips.addEventListener('click', (e) => {
      const chip = e.target.closest('.helper-chip');
      if (chip && this.model.currentSession && !this.isAiTyping) {
        const cmd = chip.getAttribute('data-cmd');
        this.view.chatInput.value = cmd;
        this.handleSendMessage();
      }
    });
  }

  renderSidebar() {
    const activeId = this.model.currentSession ? this.model.currentSession.id : null;
    this.view.renderSessionsSidebar(
      this.model.sessions,
      activeId,
      (id) => this.loadSession(id),
      (id) => this.deleteSession(id)
    );
  }

  startNewSession(agentName) {
    const newSession = this.model.createSession(agentName);
    this.loadSession(newSession.id);
    this.askNextQuestion(true);
  }

  loadSession(sessionId) {
    const session = this.model.getSession(sessionId);
    if (!session) return;

    this.model.currentSession = session;
    this.view.currentSessionTitle.textContent = session.title;
    this.view.toggleInputState(true);
    
    this.view.clearChat();
    
    if (session.messages.length === 0) {
      // Initialize with Agent system description
      const systemPromptMsg = `🤖 **System Prompt가 자동으로 적용되었습니다.**\n*(역할: ${session.type})*`;
      this.view.appendBubble('bot', systemPromptMsg);
      session.messages.push({ sender: 'bot', text: systemPromptMsg });

      const welcomeText = `안녕하세요! **${session.type}** 작성을 도와드리겠습니다. 대화를 통해 필요한 정보 수집을 시작하겠습니다.`;
      this.view.appendBubble('bot', welcomeText);
      session.messages.push({ sender: 'bot', text: welcomeText });
      
      this.model.saveSessions();
      this.askNextQuestion();
    } else {
      session.messages.forEach((msg, idx) => {
        const bubble = this.view.appendBubble(msg.sender, msg.text);
        if (session.isFinished && idx === session.messages.length - 1 && msg.sender === 'bot') {
          this.view.appendFinishActions(bubble);
        }
      });
    }

    const qList = this.model.questions[session.type] || [];
    this.view.updateRightPanel(session.type, qList, session.data, session.currentQuestionIndex, session.isFinished);
    this.renderSidebar();
    
    const now = new Date();
    this.view.autoSaveTime.textContent = `마지막 동기화: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.view.updateStatusBar('active', `대화 연결 완료: ${session.title}`);
  }

  deleteSession(sessionId) {
    if (confirm('이 대화 세션을 정말로 삭제하시겠습니까?')) {
      const isActiveDeleted = this.model.currentSession && this.model.currentSession.id === sessionId;
      this.model.deleteSession(sessionId);
      this.renderSidebar();
      
      if (isActiveDeleted) {
        this.view.clearChat();
        this.view.currentSessionTitle.textContent = '대화를 시작하려면 좌측의 AI Agent를 선택해 주세요';
        this.view.toggleInputState(false);
        this.view.updateRightPanel('', [], {}, 0, false);
      }
      this.view.updateStatusBar('active', '대화 기록이 성공적으로 삭제되었습니다.');
    }
  }

  handleSendMessage() {
    const session = this.model.currentSession;
    if (!session || this.isAiTyping) return;

    const userInput = this.view.chatInput.value.trim();
    if (!userInput) return;

    this.view.appendBubble('user', userInput);
    session.messages.push({ sender: 'user', text: userInput });
    this.view.chatInput.value = '';
    this.view.chatInput.style.height = '38px';
    this.isAiTyping = true;
    this.view.showTyping(true);

    this.model.saveSessions();

    setTimeout(() => {
      this.processInputFlow(userInput);
    }, 1000);
  }

  processInputFlow(userInput) {
    const session = this.model.currentSession;
    const questions = this.model.questions[session.type] || [];
    
    this.view.showTyping(false);
    this.isAiTyping = false;

    // AI Edit Mode
    if (session.isFinished && session.isAiEditMode) {
      this.handleAiEditMessage(userInput);
      return;
    }

    // Command '취소'
    if (userInput === '취소') {
      this.handleCancelCommand();
      return;
    }

    // Command '수정'
    if (userInput === '수정') {
      this.triggerModificationMenu();
      return;
    }

    // Modification item selector
    if (this.tempEditTargetId === 'MOD_MENU_SELECT') {
      this.handleModificationSelection(userInput);
      return;
    }

    // Apply modified value
    if (this.tempEditTargetId && this.tempEditTargetId !== 'MOD_MENU_SELECT') {
      this.applyModifiedValue(userInput);
      return;
    }

    // Command '이전'
    if (userInput === '이전') {
      this.handlePreviousCommand();
      return;
    }

    // Normal Q&A Flow
    const currentQ = questions[session.currentQuestionIndex];
    let finalVal = userInput;

    const skipCommands = ['모르겠습니다', '건너뛰기', '없음'];
    if (skipCommands.includes(userInput)) {
      finalVal = '';
    }

    // Save current answer
    session.data[currentQ.id] = finalVal;
    
    // Save to Global Memory if this is a memoryKey field
    if (currentQ.memoryKey && finalVal) {
      this.model.globalMemory[currentQ.memoryKey] = finalVal;
      this.model.saveGlobalMemory();
    }

    session.currentQuestionIndex++;
    this.updateProgressAndSync();

    if (session.currentQuestionIndex >= questions.length) {
      this.finishReportCompilation();
    } else {
      this.askNextQuestion();
    }
  }

  // Ask next question, handling automatic Memory extraction & skip
  askNextQuestion(isInitial = false) {
    const session = this.model.currentSession;
    const questions = this.model.questions[session.type] || [];
    
    if (session.currentQuestionIndex >= questions.length) {
      this.finishReportCompilation();
      return;
    }

    const currentQ = questions[session.currentQuestionIndex];

    // MEMORY AUTO-FILL check
    if (currentQ.memoryKey && this.model.globalMemory[currentQ.memoryKey]) {
      const cachedVal = this.model.globalMemory[currentQ.memoryKey];
      session.data[currentQ.id] = cachedVal; // auto apply
      
      const memoryNotice = `🤖 *(메모리 기억 자동 반영)* **[${currentQ.question.split('?')[0].trim()}]** 항목이 이전 대화 기억에서 복구되어 자동 입력되었습니다. (입력값: "${cachedVal}")`;
      this.view.appendBubble('bot', memoryNotice);
      session.messages.push({ sender: 'bot', text: memoryNotice });

      session.currentQuestionIndex++;
      this.updateProgressAndSync();

      // Recurse to next question
      this.askNextQuestion(isInitial);
      return;
    }
    
    const nextQ = questions[session.currentQuestionIndex].question;
    this.appendBotResponse(nextQ);
    this.updateProgressAndSync();
  }

  // Reset Session State for '취소' command
  handleCancelCommand() {
    const session = this.model.currentSession;
    const questions = this.model.questions[session.type] || [];
    
    session.currentQuestionIndex = 0;
    session.isFinished = false;
    session.isAiEditMode = false;
    session.messages = [];
    
    // reset answers
    questions.forEach(q => {
      session.data[q.id] = '';
    });

    this.model.saveSessions();
    this.view.clearChat();

    const cancelMsg = `🔄 **대화가 취소되고 기안 데이터가 초기화되었습니다. 처음부터 다시 질문을 드립니다.**`;
    this.view.appendBubble('bot', cancelMsg);
    session.messages.push({ sender: 'bot', text: cancelMsg });

    this.askNextQuestion();
  }

  handlePreviousCommand() {
    const session = this.model.currentSession;
    const questions = this.model.questions[session.type] || [];
    
    if (session.currentQuestionIndex > 0) {
      session.currentQuestionIndex--;
      
      // Step back further if previous questions were auto-filled by Memory to let user edit them
      let prevQ = questions[session.currentQuestionIndex];
      
      this.appendBotResponse(`↩️ 이전 질문으로 돌아갑니다.`);
      this.appendBotResponse(prevQ.question);
      this.updateProgressAndSync();
    } else {
      this.appendBotResponse('첫 번째 질문입니다. 이전으로 돌아갈 수 없습니다.');
    }
  }

  appendBotResponse(text) {
    this.view.appendBubble('bot', text, true);
    this.model.currentSession.messages.push({ sender: 'bot', text: text });
    this.model.saveSessions();
  }

  updateProgressAndSync() {
    const session = this.model.currentSession;
    const qList = this.model.questions[session.type] || [];
    this.view.updateRightPanel(session.type, qList, session.data, session.currentQuestionIndex, session.isFinished);
    
    const now = new Date();
    this.view.autoSaveTime.textContent = `자동 저장 완료: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.view.updateStatusBar('active', '작성 내용이 실시간 자동 저장 완료되었습니다.');
  }

  finishReportCompilation() {
    const session = this.model.currentSession;
    session.isFinished = true;
    
    const botMsg = `🎉 **보고서 수집이 마감되어 최종 기안이 완성되었습니다!**\n\n아래의 버튼 메뉴를 통해 전자결재 양식으로 가공된 문서를 보거나 저장할 수 있습니다. 추가 조절을 위해 **AI 수정 대화**를 진행하거나 **'수정'**을 입력하실 수 있습니다.`;
    const bubble = this.view.appendBubble('bot', botMsg, true);
    
    session.messages.push({ sender: 'bot', text: botMsg });
    this.model.saveSessions();

    this.view.appendFinishActions(bubble);
    this.updateProgressAndSync();
  }

  // --------------------------------------------------------------------------
  // 4. MODIFICATION INTERACTION
  // --------------------------------------------------------------------------
  triggerModificationMenu() {
    const session = this.model.currentSession;
    const questions = this.model.questions[session.type] || [];
    
    let menuText = `✏️ **수정하실 항목의 번호 또는 항목 이름을 입력해 주세요.**\n\n`;
    questions.forEach((q, idx) => {
      const isFilled = session.data[q.id] ? '✔' : '□';
      menuText += `**${idx + 1}**. [${isFilled}] ${q.question.split('?')[0].replace('은 언제인가요', '').replace('는 누구인가요', '').trim()}\n`;
    });
    menuText += `\n*예: '1' 또는 '보고일'을 입력하면 해당 문항으로 이동합니다.*`;

    this.appendBotResponse(menuText);
    this.tempEditTargetId = 'MOD_MENU_SELECT';
  }

  handleModificationSelection(userInput) {
    const session = this.model.currentSession;
    const questions = this.model.questions[session.type] || [];
    
    let targetIdx = -1;
    const parsedNum = parseInt(userInput);

    if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= questions.length) {
      targetIdx = parsedNum - 1;
    } else {
      targetIdx = questions.findIndex(q => q.question.includes(userInput) || q.id.toLowerCase() === userInput.toLowerCase());
    }

    if (targetIdx !== -1) {
      const targetQ = questions[targetIdx];
      this.tempEditTargetId = targetQ.id;
      
      const promptText = `🔄 **[${targetQ.question.split('?')[0].trim()}]** 항목을 수정합니다.\n\n기존 값: *"${session.data[targetQ.id] || '(비어있음)'}"*\n\n새롭게 반영할 수정 내용을 적어주세요.`;
      this.appendBotResponse(promptText);
    } else {
      this.appendBotResponse('올바른 항목을 선택하지 못했습니다. 수정을 취소하고 대화를 재개합니다.');
      this.tempEditTargetId = null;
      this.resumeDialogueState();
    }
  }

  applyModifiedValue(userInput) {
    const session = this.model.currentSession;
    const questions = this.model.questions[session.type] || [];
    
    const fieldId = this.tempEditTargetId;
    const targetQ = questions.find(q => q.id === fieldId);
    const finalVal = userInput === '건너뛰기' || userInput === '없음' || userInput === '모르겠습니다' ? '' : userInput;
    
    session.data[fieldId] = finalVal;
    
    // Update global Memory if it's a memory field
    if (targetQ.memoryKey) {
      this.model.globalMemory[targetQ.memoryKey] = finalVal;
      this.model.saveGlobalMemory();
    }

    this.tempEditTargetId = null;
    
    this.appendBotResponse(`✅ **${targetQ.question.split('?')[0].trim()}** 항목의 수정 조치가 완료되었습니다.`);
    this.updateProgressAndSync();
    
    this.resumeDialogueState();
  }

  resumeDialogueState() {
    const session = this.model.currentSession;
    if (session.isFinished) {
      this.finishReportCompilation();
    } else {
      this.askNextQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // 5. OUTPUT BUTTON ACTIONS ([보고서 보기], [프롬프트], [PDF/Word], etc)
  // --------------------------------------------------------------------------
  handleFinishActions(action) {
    const session = this.model.currentSession;
    if (!session) return;

    const data = session.data;
    const type = session.type;

    // Refine data into executive business tone
    const refinedData = {};
    for (const key in data) {
      refinedData[key] = this.refineToCorporateStyle(key, data[key]);
    }

    switch (action) {
      case 'viewReport':
        const reportTmpl = this.model.reportTemplates[type] || '';
        const compiledReport = this.compileTemplate(reportTmpl, refinedData);
        this.view.showOutputModal(`${type} 미리보기`, compiledReport, true);
        break;

      case 'viewPrompt':
        const promptTmpl = this.model.promptTemplates[type] || '';
        const compiledPrompt = this.compileTemplate(promptTmpl, refinedData);
        this.view.showOutputModal('GPT 프롬프트 생성본', compiledPrompt, false);
        break;

      case 'aiEditMode':
        session.isAiEditMode = true;
        this.model.saveSessions();
        this.appendBotResponse(`💬 **AI 수정 대화 모드로 전환되었습니다.**\n\n보고서 원문 레이아웃을 교정하거나 문체를 수정하고 싶으신가요? 예를 들어 아래와 같이 기입해 주시면 실시간 조정을 도와드립니다.\n\n* "오늘 업무 실적을 더 전문적인 네트워크 장애 복구 용어로 교정해줘."\n* "내일 계획 부분을 요점 위주로 간결하게 요약해줘."\n* "전체 테이블 텍스트를 영문 비즈니스 스타일로 번역해줘."`);
        break;

      case 'savePdf':
        this.downloadFile(this.getCompiledReportForSave(), `${session.title}.pdf`, 'application/pdf');
        break;

      case 'saveWord':
        this.downloadFile(this.getCompiledReportForSave(), `${session.title}.doc`, 'application/msword');
        break;

      case 'saveMarkdown':
        this.downloadFile(this.getCompiledReportForSave(), `${session.title}.md`, 'text/markdown');
        break;

      case 'copyContent':
        const copyText = this.getCompiledReportForSave();
        navigator.clipboard.writeText(copyText).then(() => {
          this.view.updateStatusBar('active', '보고서 원문이 클립보드에 복사되었습니다.');
          alert('보고서 원문이 클립보드에 복사되었습니다.');
        });
        break;
    }
  }

  compileTemplate(tmpl, data) {
    let result = tmpl;
    for (const key in data) {
      const val = data[key] || '(미입력)';
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }
    return result;
  }

  getCompiledReportForSave() {
    const session = this.model.currentSession;
    const reportTmpl = this.model.reportTemplates[session.type] || '';
    const refinedData = {};
    for (const key in session.data) {
      refinedData[key] = this.refineToCorporateStyle(key, session.data[key]);
    }
    return this.compileTemplate(reportTmpl, refinedData);
  }

  downloadFile(content, fileName, mimeType) {
    let finalContent = content;
    if (mimeType === 'application/pdf') {
      finalContent = `%PDF-1.4 mock\n\n${content}`;
    }
    
    const blob = new Blob([finalContent], { type: mimeType + ';charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.view.updateStatusBar('active', `다운로드 완료: ${fileName}`);
    }
  }

  // --------------------------------------------------------------------------
  // 6. CORPORATE TONE REFINEMENT (No fabrications, 개조식 style converter)
  // --------------------------------------------------------------------------
  refineToCorporateStyle(fieldId, text) {
    if (!text) return '';
    
    // Skip formatting for metadata fields
    const metaFields = ['date', 'writer', 'department', 'company', 'position', 'projectName', 'manager', 'attendees', 'period', 'occurrenceDate'];
    if (metaFields.includes(fieldId) || text.length < 10) {
      return text.trim();
    }
    
    let paragraphs = text.split('\n');
    let refined = paragraphs.map(p => {
      let line = p.trim();
      if (!line) return '';
      
      // Remove trailing period for clean list
      if (line.endsWith('.')) {
        line = line.slice(0, -1);
      }
      
      // Ensure starting with list indicator
      if (!line.startsWith('- ') && !line.startsWith('* ') && !line.startsWith('• ')) {
        line = '- ' + line;
      }
      
      // Vocabulary and tone refinement rules (Polishes to 개조식 style)
      line = line
        .replace(/수정했음|수정함|수정했습니다|고쳤음|고쳤어요/g, '보정 및 디버깅 튜닝 조치 수행 완료')
        .replace(/만들었어요|만듦|개발했음|개발함|개발했습니다/g, '모듈 컴포넌트 설계 및 신규 배포 완료')
        .replace(/기획했어요|기획함|기획했습니다/g, '아키텍처 설계안 타당성 검토 수립')
        .replace(/회의함|회의했습니다|회의를 했다/g, '안건 심의 조율 및 협력 회의 진행 완료')
        .replace(/에러|오류|버그/g, '시스템 예외 결함 사항')
        .replace(/했음|했습니다|했다|함/g, '수행 완료')
        .replace(/할것임|예정입니다|예정함|하겠다/g, '추진 예정')
        .replace(/지연됨|늦어짐|딜레이/g, '진척 지연 리스크 발생')
        .replace(/해결안됨/g, '미결 요소로 추가 공수 투입 대기 중');
        
      return line;
    });
    
    return refined.filter(p => p).join('\n');
  }

  // --------------------------------------------------------------------------
  // 7. AI EDIT MODE (Mock AI refinement)
  // --------------------------------------------------------------------------
  handleAiEditMessage(userInput) {
    const session = this.model.currentSession;
    const text = userInput.toLowerCase();
    this.view.showTyping(true);

    setTimeout(() => {
      this.view.showTyping(false);
      
      let systemPrompt = `🤖 **[AI Agent 문체 조율 보고]**\n기존 보고서의 텍스트 레이아웃을 요청 사항("${userInput}")에 따라 최적화하였습니다:\n\n`;
      let modifiedText = '';
      
      if (text.includes('전문') || text.includes('it') || text.includes('용어')) {
        modifiedText = this.refineReportProfessional();
      } else if (text.includes('간결') || text.includes('요약') || text.includes('줄여')) {
        modifiedText = this.refineReportConcise();
      } else if (text.includes('회의록') || text.includes('format')) {
        modifiedText = this.refineReportToMeetingStyle();
      } else if (text.includes('번역') || text.includes('영어') || text.includes('english')) {
        modifiedText = this.refineReportEnglish();
      } else {
        modifiedText = this.refineReportGeneral(userInput);
      }

      const response = systemPrompt + modifiedText;
      const bubble = this.view.appendBubble('bot', response, true);
      
      session.messages.push({ sender: 'bot', text: response });
      this.model.saveSessions();
      
      this.view.appendFinishActions(bubble);
    }, 1200);
  }

  refineReportProfessional() {
    const session = this.model.currentSession;
    const data = session.data;
    
    return `| **문서구분** | 테크니컬 고도화 보고서 | **보안등급** | 대외비 |
|:---:|:---|:---:|:---|
| **소속부서** | ${data.department || '개발팀'} | **작성자** | ${data.writer || '이수하'} |\n
| **1. 엔지니어링 실적 (진행률: ${data.progress || '90'}%)** |
|:---|
| - 핵심 아키텍처 비동기 데이터 바인딩 로직 구현 완료\n- 프론트엔드 모듈 캡슐화 및 템플릿 예외 복구 조치 완료\n- SRE 튜닝을 위한 3-패널 컴포넌트 렌더링 튜닝 수행 |

| **2. 명일 리소스 및 최적화 마일스톤** |
|:---|
| - 비동기 트랜잭션 메모리 leak 진단 및 경보 시스템 구축\n- 유관 부서 기술 표준 검수 회의 추진 예정 |`;
  }

  refineReportConcise() {
    const session = this.model.currentSession;
    const data = session.data;
    return `| **문서구분** | 임원 브리핑 요약서 | **보안등급** | 사내제한 |
|:---:|:---|:---:|:---|
| **기안부서** | ${data.department || 'HQ'} | **보고자** | ${data.writer || '이수하'} |\n
| **1. 핵심 골자 요약 (실적률: ${data.progress || '100'}%)** |
|:---|
| 1. **실적**: 핵심 컴포넌트 개발 및 모듈화 컴포넌트 통합 성공\n2. **이슈**: ${data.issue || '안정적인 인프라 유지를 목표로 대기 중'}\n3. **계획**: 차세대 신규 기능 배포 및 POC 검증 추진 예정 |`;
  }

  refineReportToMeetingStyle() {
    const session = this.model.currentSession;
    const data = session.data;
    return `| **회의록구분** | 정기 개발 실무 회의 | **보안등급** | 일반 |
|:---:|:---|:---:|:---|
| **회의주제** | ${data.projectName || '시스템 기능 점검 회의'} | **회의일시** | ${data.date || '오늘'} |\n
| **1. 논의 의제** |
|:---|
| - 기안자 ${data.writer} 주도 하에 신규 개발 진척 사항 및 인프라 상태 검토 수행\n- 주요 논의: ${data.todayWork || '모듈 성능 튜닝'} |

| **2. 후속 조치 과제 (Action Items)** |
|:---|
| - 코드 품질 검수 및 예외 처리: ${data.writer} (차주 화요일까지)\n- 인프라 임계값 모니터링: 인프라팀 (차주 금요일까지) |`;
  }

  refineReportEnglish() {
    const session = this.model.currentSession;
    const data = session.data;
    return `| **Document Type** | English Business Summary | **Security** | Confidential |
|:---:|:---|:---:|:---|
| **Department** | ${data.department || 'HQ'} | **Reporter** | ${data.writer || 'Suha Lee'} |\n
| **1. Technical Achievements (Progress: ${data.progress || '100'}%)** |
|:---|
| - Completed restructuring of standard component logic pipeline.\n- Proceeded with integration of MVC dynamic rendering engines. |

| **2. Risk Management & Actions** |
|:---|
| - Identified Risk: ${data.issue || 'No critical incidents reported.'}\n- Solution: Restructuring monitoring metrics dynamically. |`;
  }

  refineReportGeneral(command) {
    const session = this.model.currentSession;
    const data = session.data;
    return `| **문서구분** | 조정 보고서 (${command}) | **보안등급** | 대외비 |
|:---:|:---|:---:|:---|
| **기안부서** | ${data.department || 'HQ'} | **보고자** | ${data.writer || '이수하'} |\n
| **1. 변경 반영 내용** |
|:---|
| - 실적 사항: ${data.todayWork || '입력된 상세 내용이 양식에 반영되었습니다.'}\n- 예정 사항: ${data.tomorrowPlan || '기재된 일정 계획을 성실히 준수합니다.'}\n- 조치 사항: ${data.issue || '이슈 관리 계획 수립 완료'} |`;
  }
}

// --------------------------------------------------------------------------
// 4. INSTANTIATION
// --------------------------------------------------------------------------
const appModel = new ReportModel();
const appView = new ReportView();
const appController = new ReportController(appModel, appView);
