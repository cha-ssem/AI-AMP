/**
 * 동의대학교 인공지능 최고경영자과정 2기 (AI AMP) 웹플랫폼 Mock Data & Database Service
 */

const INDUSTRY_IMAGE_MAP = {
  "정보통신업": "images/01_information_communication.jpg",
  "제조업": "images/02_manufacturing.jpg",
  "도매 및 소매업": "images/03_wholesale_retail.jpg",
  "전문, 과학 및 기술 서비스업": "images/04_professional_scientific_technical.jpg",
  "부동산업": "images/05_real_estate.jpg",
  "건설업": "images/06_construction.jpg",
  "교육 서비스업": "images/07_education_services.jpg",
  "보건업 및 사회복지 서비스업": "images/08_health_social_work.jpg",
  "숙박 및 음식점업": "images/09_accommodation_food.jpg",
  "금융 및 보험업": "images/10_finance_insurance.jpg",
  "운수 및 창고업": "images/11_transportation_storage.jpg",
  "예술, 스포츠 및 여가관련 서비스업": "images/12_arts_sports_recreation.jpg",
  "사업시설 관리 및 사업지원 서비스업": "images/13_business_facilities_support.jpg",
  "농업, 임업 및 어업": "images/14_agriculture_forestry_fishing.jpg",
  "기타 서비스업": "images/15_other_services.jpg"
};

const INITIAL_MEMBERS = [];

const INITIAL_LECTURES = [];

const INITIAL_EVENTS = [];

const INITIAL_LEDGER = [];

const INITIAL_GALLERY = [];

/* Storage Helper */
class StorageService {
  static getGallery() {
    const data = localStorage.getItem("enterprise_13th_gallery");
    if (!data) {
      localStorage.setItem("enterprise_13th_gallery", JSON.stringify([]));
      return [];
    }
    try {
      const parsed = JSON.parse(data);
      // 이전 샘플 더미(gal-1301, gal-1302) 자동 제거
      const cleaned = parsed.filter(g => g && g.id !== "gal-1301" && g.id !== "gal-1302");
      if (cleaned.length !== parsed.length) {
        localStorage.setItem("enterprise_13th_gallery", JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      return [];
    }
  }

  static saveGallery(gallery) {
    localStorage.setItem("enterprise_13th_gallery", JSON.stringify(gallery));
  }
  static getMembers() {
    const data = localStorage.getItem("enterprise_13th_members");
    if (!data) {
      return [];
    }
    let parsed = JSON.parse(data);
    // 이전 샘플/더미 목업 계정(mem-1301~1308, mem-201~208, mem-1401~1402) 자동 제거
    const dummyIds = new Set([
      "mem-1301", "mem-1302", "mem-1303", "mem-1304", "mem-1305", "mem-1306", "mem-1307", "mem-1308",
      "mem-201", "mem-202", "mem-203", "mem-204", "mem-205", "mem-206", "mem-207", "mem-208",
      "mem-1401", "mem-1402"
    ]);
    const originalLength = parsed.length;
    parsed = parsed.filter(m => m && !dummyIds.has(m.id));

    // cohort가 문자열 형태일 경우 숫자로 자동 정규화 변환
    let updated = originalLength !== parsed.length;
    parsed.forEach(m => {
      if (typeof m.cohort === "string") {
        m.cohort = parseInt(m.cohort.replace(/[^0-9]/g, ""), 10) || 2;
        updated = true;
      }
      if ("industryIcon" in m) {
        delete m.industryIcon;
        updated = true;
      }
      if (m.industry) {
        const expectedImg = INDUSTRY_IMAGE_MAP[m.industry] || "images/15_other_services.jpg";
        if (m.industryImg !== expectedImg) {
          m.industryImg = expectedImg;
          updated = true;
        }
      }
      if (typeof m.position === "undefined") {
        m.position = "";
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem("enterprise_13th_members", JSON.stringify(parsed));
    }
    return parsed;
  }

  static saveMembers(members) {
    // cohort를 항상 정수 숫자로 보장 및 position 필드 보장
    members.forEach(m => {
      if (typeof m.cohort === "string") {
        m.cohort = parseInt(m.cohort.replace(/[^0-9]/g, ""), 10) || 2;
      }
      if (typeof m.position === "undefined") {
        m.position = "";
      }
    });
    localStorage.setItem("enterprise_13th_members", JSON.stringify(members));
  }

  static getLectures() {
    const data = localStorage.getItem("enterprise_13th_lectures");
    if (!data) {
      return [];
    }
    try {
      let parsed = JSON.parse(data);
      // 이전 목업 샘플 강의(week 1~5 더미) 제거 (실제 Firestore에서 추가/동기화된 데이터만 유지)
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  static saveLectures(lectures) {
    localStorage.setItem("enterprise_13th_lectures", JSON.stringify(lectures));
  }

  static getEvents() {
    const data = localStorage.getItem("enterprise_13th_events");
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data) || [];
    } catch (e) {
      return [];
    }
  }

  static saveEvents(events) {
    localStorage.setItem("enterprise_13th_events", JSON.stringify(events));
  }

  static getLedger() {
    const data = localStorage.getItem("enterprise_13th_ledger");
    if (!data) {
      localStorage.setItem("enterprise_13th_ledger", JSON.stringify(INITIAL_LEDGER));
      return INITIAL_LEDGER;
    }
    let parsed = JSON.parse(data);
    // 이전 샘플 더미 내역(led-01~led-04) 및 initial_balance 설정 문서 자동 필터링 제거
    let needsSave = false;
    const filtered = parsed.filter(item => {
      if (!item) return false;
      if (item.id === "initial_balance" || item.isConfig === true) {
        if (typeof item.initialBalance === "number") {
          localStorage.setItem("enterprise_13th_initial_balance", item.initialBalance.toString());
        }
        if (item.updatedAt) {
          localStorage.setItem("enterprise_13th_initial_balance_updated_at", item.updatedAt.toString());
        }
        return false;
      }
      return item.id !== "led-01" && item.id !== "led-02" && item.id !== "led-03" && item.id !== "led-04";
    }).map(item => {
      // 기존 '회원관리 탭 자동 연동' 메모 문구를 '관리자 납부 처리'로 자동 정리
      if (item && item.note && (item.note.includes("회원관리 탭 자동 연동") || item.note.includes("회원관리 일괄 납부 처리 연동"))) {
        needsSave = true;
        return { ...item, note: "관리자 납부 처리" };
      }
      return item;
    });

    if (filtered.length !== parsed.length || needsSave) {
      localStorage.setItem("enterprise_13th_ledger", JSON.stringify(filtered));
    }
    return filtered;
  }

  static saveLedger(ledger) {
    localStorage.setItem("enterprise_13th_ledger", JSON.stringify(ledger));
  }

  static getInitialBalance() {
    const val = localStorage.getItem("enterprise_13th_initial_balance");
    return val !== null ? parseInt(val, 10) : 0;
  }

  static getInitialBalanceUpdatedAt() {
    return localStorage.getItem("enterprise_13th_initial_balance_updated_at") || "";
  }

  static saveInitialBalance(amount, updatedAt) {
    localStorage.setItem("enterprise_13th_initial_balance", amount.toString());
    if (updatedAt) {
      localStorage.setItem("enterprise_13th_initial_balance_updated_at", updatedAt.toString());
    }
  }

  static getCurrentUserRole() {
    return localStorage.getItem("enterprise_current_role") || "guest";
  }

  static setCurrentUserRole(role) {
    localStorage.setItem("enterprise_current_role", role);
  }

  static getCurrentUserId() {
    return localStorage.getItem("enterprise_current_user_id") || "";
  }

  static setCurrentUserId(userId) {
    if (userId) {
      localStorage.setItem("enterprise_current_user_id", userId);
    } else {
      localStorage.removeItem("enterprise_current_user_id");
    }
  }

  /* 💡 세션 만료(30분 자동 로그아웃) 시간 관리 */
  static getLastActiveTime() {
    return localStorage.getItem("enterprise_last_active_time") || "";
  }

  static setLastActiveTime(time) {
    if (time) {
      localStorage.setItem("enterprise_last_active_time", time.toString());
    } else {
      localStorage.removeItem("enterprise_last_active_time");
    }
  }

  /* 💡 회원 등급별 동적 권한(RBAC) 스토리지 관리 */
  static getPermissions() {
    const data = localStorage.getItem("enterprise_13th_permissions");
    if (!data) {
      localStorage.setItem("enterprise_13th_permissions", JSON.stringify(DEFAULT_PERMISSIONS));
      return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
    }
    try {
      const parsed = JSON.parse(data);
      // 누락된 기능 항목이 있는 경우 기본값으로 자동 병합 보정
      const merged = { ...DEFAULT_PERMISSIONS };
      Object.keys(DEFAULT_PERMISSIONS).forEach(feat => {
        merged[feat] = { ...DEFAULT_PERMISSIONS[feat], ...(parsed[feat] || {}) };
        // 관리자(admin) 권한은 항상 true 고정
        merged[feat].admin = true;
      });
      return merged;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
    }
  }

  static savePermissions(permissions) {
    localStorage.setItem("enterprise_13th_permissions", JSON.stringify(permissions));
  }
}

/* 💡 기본 회원 등급별 기능 접근 권한 정의 */
const DEFAULT_PERMISSIONS = {
  members_view: { guest: false, regular: false, full: true, exec: true, admin: true },
  curriculum_download: { guest: false, regular: false, full: true, exec: true, admin: true },
  curriculum_manage: { guest: false, regular: false, full: false, exec: true, admin: true },
  gallery_view: { guest: false, regular: true, full: true, exec: true, admin: true },
  gallery_manage: { guest: false, regular: false, full: false, exec: true, admin: true },
  ledger_view: { guest: false, regular: false, full: false, exec: true, admin: true },
  ledger_manage: { guest: false, regular: false, full: false, exec: false, admin: true }
};

/* 💡 권한 제어 매트릭스 대시보드 표시용 기능 메타데이터 */
const PERMISSION_FEATURES = [
  { key: "members_view", name: "👥 원우 디렉토리 열람", desc: "Members 메뉴에서 전체 회원 프로필/연락처/업종 정보 열람 (등급 변경·계정 통합은 관리자 전용)" },
  { key: "curriculum_download", name: "📁 강의 교안(PDF) 다운로드", desc: "Curriculum 메뉴에서 강의 교안 파일 다운로드 버튼 활성화" },
  { key: "curriculum_manage", name: "📅 강의 & 행사 일정 관리", desc: "강의 커리큘럼 및 네트워킹 행사 등록·수정·삭제 및 카톡공유" },
  { key: "gallery_view", name: "📸 갤러리 스토리 & 사진 열람", desc: "Gallery 메뉴의 행사 기록, 현장 사진 및 인포그래픽 고화질 확대보기" },
  { key: "gallery_manage", name: "✍️ 갤러리 게시글 등록·관리", desc: "새 행사 이야기 및 사진 등록, 세부내용 수정 및 삭제" },
  { key: "ledger_view", name: "💰 회계 장부 열람", desc: "Admin & Ledger 메뉴 접근 및 찬조/회식 장부 내역과 잔액 열람" },
  { key: "ledger_manage", name: "⚙️ 회계 장부 수정·삭제 및 이월잔고 관리", desc: "기입된 장부 내역의 수정·삭제, 영수증 관리 및 초기 이월잔고 설정 (관리자 전용)" }
];
