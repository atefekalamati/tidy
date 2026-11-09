---
title: "سند نیازمندی‌های محصول (PRD) | توسعه و ارتقای برد مدیریت پروژه"
version: "1.0 - Draft for existing-product assessment"
date: "2026-11-08"
status: "پیشنهادی؛ نیازمند تطبیق با کد و امکانات موجود"
language: "fa-IR"
direction: "rtl"
---

# سند نیازمندی‌های محصول (PRD)
## ارتقا و توسعه تدریجی برد مدیریت پروژه موجود

**نسخه سند:** ۱.۰ — پیش‌نویس اجرایی  
**تاریخ:** ۱۷ آبان ۱۴۰۵ / ۸ نوامبر ۲۰۲۶  
**وضعیت:** Enhancement PRD؛ نه PRD ساخت پروژه از صفر  
**دامنه:** ترکیب تجربه کاربری Trello، مدیریت فرایند Jira، اتصال توسعه GitLab و انعطاف نماهای Notion  
**مخاطب:** مالک محصول، طراح UX/UI، Frontend، Backend، QA و عامل‌های کدنویسی  
**نکته مهم:** به مخزن کد و مستندات پیاده‌سازی فعلی برد دسترسی تأییدشده وجود ندارد. همه وضعیت‌های «موجود/ناقص/ناموجود» باید در فاز صفر با بررسی واقعی کد تعیین شوند. هیچ ویژگی در این سند به‌عنوان ویژگی پیاده‌شده قطعی معرفی نشده است.

---

## ۱. خلاصه اجرایی

این سند برای تکمیل و ارتقای **یک سامانه مدیریت پروژه که بخشی از آن قبلاً پیاده‌سازی شده** تهیه شده است. هدف، بازنویسی محصول یا تعویض اجباری فناوری‌ها نیست؛ هدف این است که قابلیت‌های موجود حفظ و بهینه‌سازی شوند و مجموعه‌ای از ویژگی‌های ارزشمند از Trello، Jira، GitLab و Notion به‌شکل مرحله‌ای، هماهنگ و قابل آزمون به آن اضافه شود.

**راهبرد محصول:** سادگی تعامل Trello + Workflow و برنامه‌ریزی Jira + اتصال Issue به کد GitLab + مدل داده و Viewهای منعطف Notion.

**اصل معماری:** Task یک موجودیت مشترک و مستقل از نما است؛ Board، Table، Calendar و Timeline فقط روش‌های نمایش، فیلتر، مرتب‌سازی و گروه‌بندی همان داده هستند.

**اصل توسعه:** ممیزی → Gap Analysis → کمترین تغییر سازگار → Feature Flag → تست بازگشت → انتشار تدریجی → سنجش کیفیت.

### ۱.۱ خروجی‌های مورد انتظار

1. برد Kanban روان، قابل شخصی‌سازی و پایدار، با حفظ داده‌های قبلی.
2. پنل جزئیات Task با مسئول، اولویت، زمان، برچسب، Checklist، Subtask، کامنت، فایل و تاریخچه.
3. گردش‌کار قابل تنظیم، Backlog و Sprint در صورت نیاز پروژه.
4. نماهای Board، Table، Calendar و سپس Timeline/Gantt بر پایه یک منبع داده مشترک.
5. همکاری تیمی، اعلان‌ها و مجوزهای قابل اتکا.
6. اتصال تدریجی Task به Repository، Branch، Merge Request/Pull Request و وضعیت بررسی کد.
7. گزارش‌ها و اتوماسیون قابل پیکربندی، بدون وابستگی اجباری به نسخه اولیه.

### ۱.۲ محدودیت‌های کلیدی

- **عدم بازنویسی غیرضروری:** هیچ ماژول موجود نباید صرفاً برای هماهنگ‌کردن ظاهر با ابزارهای مرجع حذف شود.
- **عدم فرض درباره Stack:** انتخاب React، Vue، Next.js، ASP.NET یا دیتابیس جدید در این سند الزامی نیست؛ پیاده‌سازی به فناوری فعلی وابسته است.
- **حفظ تجربه فعلی کاربر:** URL، شناسه Task، داده، نقش و قابلیت‌های فعلی تا حد امکان سازگار باقی بمانند.
- **بومی‌سازی:** فارسی و RTL در صورت نیاز محصول، همراه نمایش صحیح شناسه‌ها، تاریخ، اعداد و بخش‌های کد LTR.
- **قابلیت انتخاب:** Sprint، Git Integration، Gantt و Automation برای همه پروژه‌ها اجباری نیستند.
- **Security by design:** مجوزها در Backend کنترل شوند و رخدادهای حساس قابل ردگیری باشند.

---

## ۲. وضعیت فعلی و فرایند شناخت محصول (Baseline Audit)

### ۲.۱ ماتریس ممیزی وضع موجود

برای هر ردیف، تیم توسعه پس از بررسی پروژه یکی از برچسب‌های **موجود و سالم / موجود ولی نیازمند بهبود / پیاده‌سازی ناقص / ناموجود / خارج از دامنه** را ثبت کند.

| شناسه | ماژول یا قابلیت | وضعیت فعلی | اقدام پیشنهادی | شواهد لازم |
|---|---|---|---|---|
| AUD-01 | ساخت Workspace / Project / Board | بررسی‌نشده | حفظ یا تکمیل | مسیرها، APIها، اسکرین‌شات |
| AUD-02 | ستون و وضعیت Task | بررسی‌نشده | رفع تناقض وضعیت/ستون | Schema و رفتار UI |
| AUD-03 | ایجاد، ویرایش، حذف Task | بررسی‌نشده | بازاستفاده یا توسعه | Component و Endpoint |
| AUD-04 | Drag & Drop و ذخیره ترتیب | بررسی‌نشده | مقاوم‌سازی | تست تغییر ترتیب و refresh |
| AUD-05 | کاربران، اعضا و نقش‌ها | بررسی‌نشده | تکمیل مجوزها | نقش‌ها و Authorization |
| AUD-06 | جزئیات، Label، Priority، Due Date | بررسی‌نشده | تکمیل فیلدهای مفقود | فرم و مدل داده |
| AUD-07 | Checklist / Subtask | بررسی‌نشده | حفظ و یکپارچه‌سازی | روابط و API |
| AUD-08 | Comments / Attachments | بررسی‌نشده | افزودن/بهبود | ذخیره‌سازی و امنیت |
| AUD-09 | Search / Filter / Saved Views | بررسی‌نشده | اصلاح رفتار و عملکرد | query و state |
| AUD-10 | Activity Log / Notifications | بررسی‌نشده | طراحی حداقل ثبت رخداد | لاگ و اعلان |
| AUD-11 | Backlog / Sprint / Dependencies | بررسی‌نشده | مرحله دوم | مدل و گردش‌کار |
| AUD-12 | Table / Calendar / Timeline | بررسی‌نشده | استفاده از داده مشترک | تطابق Viewها |
| AUD-13 | Integrations / Automation | بررسی‌نشده | مرحله پیشرفته | تنظیمات و Secretها |
| AUD-14 | Tests / Performance / Accessibility | بررسی‌نشده | تعریف Baseline | تست، مانیتورینگ |

### ۲.۲ دستورالعمل اجباری قبل از تغییر کد

1. ساختار Repository، مستندات، Components، Models، API routes، migrations و Tests را بررسی و خلاصه کنید.
2. برای هر `FR` در این سند: `Existing / Improve / Add / Defer / Reject` را تعیین کنید.
3. قابلیت‌های هم‌پوشان را شناسایی کنید؛ **هیچ جدول، endpoint یا کامپوننت تکراری بدون دلیل ایجاد نشود**.
4. وابستگی‌ها و ریسک‌های Migration را ثبت کنید؛ snapshot/backup و روش rollback برای داده‌های حساس ضروری است.
5. مبنای عملکردی و بصری فعلی را با Screenshot و Smoke Test ثبت کنید.
6. تنها پس از تأیید نقشه تغییرات، Implementation Plan مبتنی بر کد موجود تولید شود.

**تعریف Done برای فاز صفر:** یک `Current-State Audit` شامل نقشه ماژول‌ها، قابلیت‌های تأییدشده، گپ‌ها، ریسک‌ها، قراردادهای API موجود، صفحات قابل حفظ و برنامه افزایش تدریجی محصول تهیه شده باشد.

---

## ۳. چشم‌انداز، کاربران و سناریوها

### ۳.۱ کاربران هدف

| نقش | نیاز اصلی | تجربه مورد انتظار |
|---|---|---|
| Workspace Owner | کنترل فضا، اعضا، مجوزها، سیاست‌ها | تنظیمات مرکزی و گزارش کلی |
| Project Admin / Manager | برنامه‌ریزی، واگذاری، پایش پیشرفت | Board، Backlog، Sprint، Reports |
| Team Member | دیدن کارهای خود، پیشبرد تسک | ساده‌ترین مسیر تغییر وضعیت و ثبت فعالیت |
| Reviewer | بررسی، اعلام نظر و تأیید نتیجه | صف In Review و تعامل با Task/MR |
| Viewer / Stakeholder | مشاهده وضعیت و خروجی‌ها | دسترسی فقط خواندنی و نماهای خلاصه |

نقش‌های بالا **مدل پیشنهادی** هستند و باید با نقش‌های واقعی پروژه مطابقت داده شوند. سطح دسترسی می‌تواند در سطح Workspace، Project یا Board تعریف شود؛ ارث‌بری و استثناها باید شفاف باشند.

### ۳.۲ سناریوهای اصلی (User Journeys)

- **برنامه‌ریزی کار:** مدیر Project ایجاد می‌کند، Workflow تعریف می‌کند، Task می‌سازد، مسئول و موعد می‌گذارد و کارها را اولویت‌بندی می‌کند.
- **انجام کار:** عضو تیم Task را در Board پیدا می‌کند، جزئیات را می‌خواند، Checklist را تیک می‌زند، کامنت می‌گذارد و کارت را به مرحله بعد می‌برد.
- **بازبینی:** Reviewer از ستون Review وارد Task می‌شود، لینک MR را بررسی می‌کند، بازخورد می‌دهد و نتیجه را تعیین می‌کند.
- **مدیریت زمان:** مدیر در Backlog کارهای Sprint آینده را انتخاب می‌کند و با گزارش‌ها Bottleneck را پیدا می‌کند.
- **استفاده چندنما:** کاربر همان Taskها را در Calendar بر اساس موعد، در Table با فیلتر و در Board بر اساس وضعیت می‌بیند.
- **اتوماسیون:** مدیر یک Rule تعریف می‌کند: ورود Task به Review → اعلان به Reviewer؛ اجرای تکراری یا حلقه‌ای جلوگیری می‌شود.

### ۳.۳ شاخص‌های موفقیت پیشنهادی

| شاخص | تعریف | هدف اولیه پیشنهادی (قابل بازنگری بعد از Baseline) |
|---|---|---|
| Task creation success | ایجاد موفق / تلاش‌های معتبر | ≥ ۹۹٪ |
| Move persistence | جابه‌جایی‌هایی که بعد از Refresh پابرجا هستند | ≥ ۹۹٫۹٪ |
| Board responsiveness | زمان تعامل اصلی در بار معمول و دستگاه مرجع | p95 ≤ ۳۰۰ms در UI؛ هدف آزمایشی |
| Search response | پاسخ برای مجموعه داده مرجع | p95 ≤ ۱s؛ پس از سنجش تعیین شود |
| Task synchronization | نبود اختلاف داده میان نماها | ۱۰۰٪ موارد تست‌شده |
| Accessibility | مسیرهای اصلی بدون ماوس | موفقیت تمام سناریوهای بحرانی |
| Feature adoption | سهم پروژه‌های فعال‌کننده قابلیت اختیاری | فقط مانیتور؛ بدون اجبار |

این اعداد **اهداف پیشنهادی برای توافق تیم** هستند، نه ادعای عملکرد فعلی.

---

## ۴. دامنه قابلیت‌ها و اولویت انتشار

**اولویت‌ها:** `P0` = پایه لازم برای تجربه باثبات / `P1` = ارزش افزوده اصلی / `P2` = پیشرفته یا مشروط.  
**نوع تغییر:** `Core Enhancement` = بهبود بخش موجود در صورت وجود؛ `New Optional` = ویژگی جدید قابل فعال‌سازی؛ `Foundational` = زیرساخت لازم.

| ID | قابلیت | الهام | اولویت | نوع تغییر | انتشار پیشنهادی |
|---|---|---|---|---|---|
| FR-01 | مدیریت Workspace / Project / Board | همه | P0 | Core Enhancement | R1 |
| FR-02 | ستون‌ها و Workflow قابل تنظیم | Trello/Jira | P0 | Core Enhancement | R1 |
| FR-03 | Task CRUD + جزئیات کامل | Trello | P0 | Core Enhancement | R1 |
| FR-04 | Drag & Drop پایدار + ترتیب‌دهی | Trello | P0 | Core Enhancement | R1 |
| FR-05 | مسئول، اولویت، تاریخ، برچسب | Trello/Jira | P0 | Core Enhancement | R1 |
| FR-06 | Checklist + محاسبه پیشرفت | Trello | P0 | Core Enhancement | R1 |
| FR-07 | جست‌وجو، فیلتر و Sorting | Notion/Trello | P0 | Core Enhancement | R1 |
| FR-08 | Comments / @mention | Trello/GitLab | P1 | Core Enhancement | R1 |
| FR-09 | Activity History / Audit Trail | GitLab | P0 | Foundational | R1 |
| FR-10 | Files / Attachments | Trello/Notion | P1 | Core Enhancement | R2 |
| FR-11 | Roles & Permissions | Jira/GitLab | P0 | Foundational | R1 |
| FR-12 | Subtasks / Parent-Child | Jira/Notion | P1 | New Optional | R2 |
| FR-13 | Backlog / Sprint | Jira | P1 | New Optional | R3 |
| FR-14 | WIP Limits | Jira | P1 | New Optional | R2 |
| FR-15 | Dependencies / Blocked | Jira | P1 | New Optional | R3 |
| FR-16 | Board/Table/Calendar Views | Notion | P1 | New Optional | R2 |
| FR-17 | Timeline / Gantt | Notion/Jira | P2 | New Optional | R4 |
| FR-18 | Custom Fields | Notion/Trello | P1 | New Optional | R3 |
| FR-19 | Saved Filters / Personal Views | Notion | P1 | New Optional | R2 |
| FR-20 | Templates | Trello/Notion | P1 | New Optional | R3 |
| FR-21 | Notifications / Inbox | همه | P1 | Foundational | R2 |
| FR-22 | Milestones / Releases | GitLab | P1 | New Optional | R3 |
| FR-23 | Repo / Branch / MR-PR links | GitLab | P1 | New Optional | R3 |
| FR-24 | Git Provider Webhooks / CI state | GitLab | P2 | New Optional | R4 |
| FR-25 | Dashboard & Reports | Jira | P1 | New Optional | R3 |
| FR-26 | Automation Rules | Trello/Jira | P2 | New Optional | R4 |
| FR-27 | Real-time collaboration | Notion | P2 | New Optional | R4 |
| FR-28 | Import/Export | همه | P1 | Foundational | R3 |
| FR-29 | Responsive / RTL / Accessibility | همه | P0 | Core Enhancement | R1 |
| FR-30 | Archive, Restore, Soft Delete | Trello | P0 | Foundational | R1 |

**شرط مهم:** ترتیب `R1–R4` پس از فاز صفر و براساس امکانات واقعی پروژه تنظیم می‌شود. ویژگی‌ای که هم‌اکنون سالم است دوباره ساخته نمی‌شود.

---

## ۵. نیازمندی‌های عملکردی و معیار پذیرش

### ۵.۱ ساختار و مدیریت برد — FR-01، FR-02

**رفتار محصول:** Workspace شامل Project است. یک Project می‌تواند چند View/Board داشته باشد. ستون‌های Kanban وضعیت‌ها یا گروه‌بندی انتخاب‌شده را نشان می‌دهند. عنوان، رنگ، ترتیب، سیاست نمایش و WIP هر ستون در صورت مجوز قابل ویرایش است.

**قواعد:**
- افزودن و تغییر نام ستون مجاز است؛ حذف ستونی که Task دارد باید با انتقال امن Taskها یا انتخاب وضعیت جایگزین همراه باشد.
- وضعیت پایانی `Done` از مفهوم آرشیوشدن جدا است.
- `Blocked` یک Flag/Relationship است، نه لزوماً Status یا Column مستقل.
- Workflow پیش‌فرض: `To Do → In Progress → In Review → Done`، اما قابل تغییر با تنظیمات پروژه.

**Acceptance Criteria:**
- `AC-01.1` مدیر مجاز بتواند ستون ایجاد، تغییر نام و مرتب کند؛ داده‌ها بعد از Refresh حفظ شوند.
- `AC-01.2` حذف ستون دارای Task بدون تعیین مقصد مجاز نباشد.
- `AC-01.3` عضو بدون مجوز نتواند Workflow را در API تغییر دهد.
- `AC-01.4` تغییر وضعیت از طریق Board و Task Detail نتیجه یکسان داشته باشد.

### ۵.۲ کارت و پنل جزئیات Task — FR-03، FR-05

**فیلدهای پایه:** شناسه پایدار، عنوان، توضیح Rich Text/Markdown، وضعیت، اولویت، مسئول(ها)، سازنده، Label، تاریخ شروع/موعد، زمان ایجاد/ویرایش، Position، Project ID، آرشیو.

**رابط:** روی برد فقط عنوان، اولویت، مسئول، برچسب، موعد و علائم مهم به‌صورت فشرده دیده شوند؛ کلیک روی کارت یک Drawer/Modal باز کند. تغییرات باید در صورت نیاز Draft و حالت ذخیره داشته باشند؛ برای فیلدهای کم‌خطر می‌توان Auto-save با بازخورد استفاده کرد.

**Acceptance Criteria:**
- `AC-03.1` تمام فیلدها پس از ذخیره و Refresh پابرجا باشند.
- `AC-03.2` عنوان Task خالی پذیرفته نشود و خطای واضح نمایش داده شود.
- `AC-03.3` شناسه Task بعد از تغییر عنوان و وضعیت ثابت بماند.
- `AC-03.4` کاربر بتواند لینک مستقیم جزئیات Task را باز کند.
- `AC-03.5` متون و فایل‌های کاربر پیش از نمایش امن‌سازی شوند؛ اسکریپت تزریق‌شده اجرا نشود.

### ۵.۳ Drag & Drop و مرتب‌سازی — FR-04

**رفتار محصول:** جابه‌جایی یک کارت در ستون یا بین ستون‌ها همراه پیش‌نمایش محل رهاکردن، Auto-scroll، نشانه بصری و ذخیره سریع. در دستگاه‌های بدون Drag باید راه جایگزین `Move to…` وجود داشته باشد.

**Edge Cases:** دو کاربر هم‌زمان کارت یکسان را جابه‌جا می‌کنند؛ درخواست ذخیره شکست می‌خورد؛ مقصد WIP Limit دارد؛ Workflow اجازه Transition نمی‌دهد؛ ستون در همین لحظه حذف شده است.

**Acceptance Criteria:**
- `AC-04.1` ترتیب کارت‌ها پس از Refresh حفظ شود.
- `AC-04.2` در شکست API، UI به حالت معتبر برگردد یا خطای بازیابی‌پذیر نشان دهد.
- `AC-04.3` جابه‌جایی غیرمجاز از طریق API رد شود.
- `AC-04.4` معادل Keyboard و منوی انتقال برای قابلیت Drag وجود داشته باشد.
- `AC-04.5` به‌روزرسانی هم‌زمان باعث دو نسخه از یک Task نشود.

### ۵.۴ Checklist، Subtask و وابستگی — FR-06، FR-12، FR-15

- **Checklist:** آیتم سبک با `title/isCompleted/position`، بدون مسئول و تاریخ مستقل در مدل پایه. پیشرفت = `completed / total` و برای لیست خالی «بدون پیشرفت تعریف‌شده» نشان داده شود، نه لزوماً ۱۰۰٪.
- **Subtask:** خود Task با `parentTaskId`؛ می‌تواند وضعیت، مسئول و موعد مستقل داشته باشد. عمق تو‌در‌تو در نسخه نخست حداکثر یک سطح یا مقدار توافق‌شده.
- **Dependency:** رابطه `blocks / blocked_by / relates_to`؛ چرخه در `blocks` نباید ایجاد شود. هشدار Blocked می‌تواند حتی در ستون In Progress نمایش داده شود.

**Acceptance Criteria:**
- `AC-06.1` تغییر Checklist درصد تکمیل را فوری و صحیح به‌روزرسانی کند.
- `AC-12.1` Subtask با شناسه مستقل، بازشدن مستقیم و Parent مشخص قابل مدیریت باشد.
- `AC-15.1` ایجاد چرخه `A blocks B` و `B blocks A` رد شود.
- `AC-15.2` وضعیت Blocked با انتقال Task به ستون دیگر از بین نرود مگر طبق قانون تعریف‌شده.

### ۵.۵ Labels، Custom Fields و Templates — FR-05، FR-18، FR-20

**Labels:** نام، رنگ، دامنه کاربرد و محدودیت تعداد قابل پیکربندی. **Custom Field Types:** `text`, `number`, `date`, `single_select`, `multi_select`, `checkbox`, `user`؛ در نسخه پیشرفته `formula` یا `relation`. **Templates:** عنوان، توضیح، Checklist، برچسب‌ها، فیلدهای سفارشی و قوانین پیش‌فرض؛ بدون کپی‌کردن Activity و داده محرمانه شخصی.

**Acceptance Criteria:**
- `AC-18.1` افزودن Custom Field موجب شکستن Taskهای قبلی نشود.
- `AC-18.2` انواع داده در Backend اعتبارسنجی شوند.
- `AC-20.1` ایجاد Task از Template، Task جدید با شناسه جدید بسازد.
- `AC-20.2` حذف Template، Taskهای ساخته‌شده از آن را حذف نکند.

### ۵.۶ Search، Filter و Saved Views — FR-07، FR-19

**فیلترها:** Status، Assignee، Priority، Labels، Due Date، Overdue، Blocked، Sprint، Milestone و عبارت جست‌وجو. ترکیب `AND/OR` برای نسخه تکمیلی. هر View دارای `groupBy`, `sortBy`, `filters`, `visibleFields`, `displayType` است و می‌تواند Private یا Shared باشد.

**Acceptance Criteria:**
- `AC-07.1` در همه Viewها نتیجه فیلتر یکسان باشد (به‌جز تفاوت‌های نمایش).
- `AC-07.2` گزینه Clear All فیلترها را پاک کند؛ وضعیت انتخاب‌شده قابل درک باشد.
- `AC-19.1` View شخصی بدون مجوز برای دیگران قابل مشاهده نباشد.
- `AC-19.2` تغییر View باعث حذف یا تکثیر Task نشود.

### ۵.۷ Collaboration، Comments، Files و Activity — FR-08، FR-09، FR-10

**Comments:** ثبت، ویرایش با نشان «ویرایش‌شده»، حذف مجاز، Mention عضو دارای دسترسی. **Attachments:** محدودیت نوع/حجم قابل تنظیم، آپلود امن، نام و اندازه، دانلود مجاز، بررسی بدافزار در صورت زیرساخت. **Activity Log:** رخدادهای ایجاد/حذف/جابجایی، تغییر مسئول، موعد، اولویت و انتقال Workflow به‌همراه Actor و Timestamp.

**Acceptance Criteria:**
- `AC-08.1` Mention به شخصی بدون دسترسی به Project، داده آن را افشا نکند.
- `AC-09.1` هر تغییر مهم با Actor، زمان و مقدار قبلی/جدید (در حد مجاز) ثبت شود.
- `AC-10.1` کاربران غیرمجاز نتوانند فایل را با دانستن URL دانلود کنند.
- `AC-10.2` حذف فایل، رفتار سازگار با سیاست نگهداری و Audit داشته باشد.

### ۵.۸ Backlog، Sprint و WIP — FR-13، FR-14

**Backlog:** Taskهای اولویت‌بندی‌شده خارج از Sprint یا آماده برنامه‌ریزی. **Sprint:** نام، هدف، تاریخ شروع/پایان، وضعیت `planned/active/completed` و اعضای Task. **WIP Limit:** سقف تعداد کارت در هر Status یا ستون؛ حالت `warning` پیش‌فرض، حالت `hard_block` اختیاری.

**Acceptance Criteria:**
- `AC-13.1` Task بدون Sprint در Backlog دیده شود و به Sprint قابل انتقال باشد.
- `AC-13.2` پایان Sprint، کارهای ناتمام را با تصمیم مدیر به Backlog یا Sprint دیگر منتقل کند؛ حذف خودکار ممنوع.
- `AC-14.1` عبور از WIP Limit به‌صورت بصری مشخص شود.
- `AC-14.2` در حالت Hard Block، درخواست غیرمجاز در Backend نیز رد شود.

### ۵.۹ Multiple Views و Timeline — FR-16، FR-17

- **Board:** گروه‌بندی پیش‌فرض براساس Status؛ امکان `Assignee/Label/Priority` اگر مدل اجازه دهد.
- **Table:** جدول قابل مرتب‌سازی، انتخاب ستون، فیلتر و ویرایش امن مقادیر.
- **Calendar:** نمایش Task براساس Due Date/Start Date؛ Task بدون تاریخ در فهرست جدا باقی بماند.
- **Timeline/Gantt:** نمایش بازه زمانی، Milestone، Dependency و هشدار تعارض؛ بدون تغییر خودکار موعد وابسته مگر سیاست صریح.

**Acceptance Criteria:**
- `AC-16.1` تغییر یک Task در Table پس از به‌روزرسانی در Board هم دیده شود.
- `AC-16.2` یک Task در دیتابیس صرفاً به دلیل حضور در چهار View چهار نسخه نشود.
- `AC-16.3` Task فاقد Due Date گم نشود و در نمای مناسب قابل دسترسی باشد.
- `AC-17.1` تاریخ شروع پس از موعد، بدون بازخورد خطا پذیرفته نشود.

### ۵.۱۰ Milestones و Git Integration — FR-22، FR-23، FR-24

**Milestone:** نام، هدف، موعد، وضعیت و درصد پیشرفت براساس Taskهای عضو. **Integration اولیه:** فیلدهای لینک Repository، Branch و MR/PR روی Task. **Integration پیشرفته:** OAuth/App integration با حداقل دسترسی و Webhook برای دریافت وضعیت MR/PR و CI.

**قواعد:**
- لینک صرفاً باید از Providerهای مجاز یا URL معتبر عبور کند؛ همه لینک‌ها بدون اجرای Script باز شوند.
- Eventهای Webhook باید امضای معتبر، شناسه یکتا، idempotency و کنترل Replay داشته باشند.
- Merge شدن MR به‌صورت پیش‌فرض Task را Done نکند؛ Mapping باید تنظیم‌پذیر باشد.
- Secret و Token در Client نگهداری نشود؛ Refresh Token و Scopeها به‌شکل امن مدیریت شوند.

**Acceptance Criteria:**
- `AC-23.1` Task بتواند چند Link مرتبط را نگهداری کند، بدون اینکه Git Integration فعال باشد.
- `AC-24.1` Event تکراری Webhook باعث ایجاد دو Activity یا اجرای دوباره Transition نشود.
- `AC-24.2` خطای Provider خارجی برد اصلی را از کار نیندازد.

### ۵.۱۱ Notifications و Automation — FR-21، FR-26

**Notifications:** فعالیت‌های Assigned، Mention، Deadline، Review Request و تغییرات مرتبط؛ قابلیت Mark as Read، مدیریت ترجیحات و جلوگیری از اعلان تکراری. **Automation:** Trigger (`task.created`, `status.changed`, `due_date.reached`, `comment.mentioned`) + Condition + Action (`assign`, `move`, `label`, `notify`, `comment`) با Rule Owner و Execution Log.

**قوانین ایمنی:** سقف تعداد اجرا، محدودیت عمق زنجیره، جلوگیری از Loop، کنترل مجوز اجرا، ثبت خروجی، قابلیت Disable و Dry Run. قواعدی که احتمال تغییر انبوه یا ارسال بیرونی دارند نیازمند تأیید ویژه‌اند.

**Acceptance Criteria:**
- `AC-21.1` هر Notification به Task مجاز کاربر پیوند بخورد و محتوای غیرمجاز افشا نکند.
- `AC-26.1` اجرای Rule خطادار در Log با پیام قابل پیگیری ثبت شود.
- `AC-26.2` یک Rule نتواند بی‌نهایت خودش را اجرا کند.
- `AC-26.3` تغییر Rule بر Taskهای قبلی فقط در صورت Trigger/اجرای صریح اثر بگذارد.

### ۵.۱۲ Dashboard، Analytics و Import/Export — FR-25، FR-28

**Dashboard پیشنهادی:** کل Taskها براساس Status، کارهای Overdue، تکمیل هر Milestone/Sprint، WIP، Throughput، Cycle Time، Lead Time و Burndown (برای Sprint). **Import/Export:** CSV و در صورت نیاز JSON، اعتبارسنجی و Preview قبل از Import، ثبت خطاهای سطری و جلوگیری از Duplicate.

**تعاریف داده‌ای:**
- `Throughput`: تعداد Taskهایی که در بازه زمانی به وضعیت پایانی وارد شده‌اند.
- `Cycle Time`: فاصله نخستین ورود به حالت فعال تا تکمیل (با سیاست مشخص برای بازگشایی).
- `Lead Time`: فاصله ایجاد Task تا تکمیل.
- `Burndown`: حجم کار باقیمانده در طول Sprint؛ واحد شمار Task یا Story Points باید در تنظیمات انتخاب شود.

**Acceptance Criteria:**
- `AC-25.1` تعریف، بازه زمانی و واحد هر نمودار روشن باشد.
- `AC-25.2` Dashboard مطابق مجوز داده‌ها را نمایش دهد.
- `AC-28.1` Import آزمایشی Preview و تعداد ردیف‌های قابل قبول/ردشده را نشان دهد.
- `AC-28.2` خطای Import موجب نیمه‌کاره‌ماندن بی‌خبر داده‌ها نشود؛ حالت تراکنشی یا گزارش Partial Success مشخص باشد.

### ۵.۱۳ Archive، Soft Delete و بازیابی — FR-30

- آرشیو، Task را از نمای فعال مخفی می‌کند اما قابلیت بازیابی دارد.
- حذف نرم برای موجودیت‌های حساس با `deletedAt/deletedBy` انجام می‌شود؛ سیاست پاک‌سازی دائمی جداگانه تعریف شود.
- لینک‌های قدیمی تا حد امکان به صفحه بایگانی یا پیام مناسب هدایت شوند.

**Acceptance Criteria:**
- `AC-30.1` آرشیو باعث از بین رفتن Comments، Subtasks و Activity نشود.
- `AC-30.2` کاربر فاقد مجوز نتواند Task حذف‌شده را از API بخواند.

---

## ۶. طراحی تجربه کاربری (UX/UI)

### ۶.۱ اصول طراحی

1. **Progressive Disclosure:** روی کارت اطلاعات ضروری، در Drawer جزئیات و در Settings گزینه‌های پیشرفته.
2. **Consistency:** نام Status، رنگ اولویت، Icon و رفتار کنترل‌ها در همه Viewها ثابت باشد.
3. **Optimistic UI با بازیابی:** تعامل روان همراه Feedback و امکان Rollback یا Retry.
4. **Empty/Loading/Error States:** برای Board خالی، نبود نتیجه، خطای شبکه، دسترسی ردشده و بارگذاری مجزا طراحی شود.
5. **Responsive:** دسکتاپ با ستون‌های افقی و اسکرول کنترل‌شده؛ موبایل با نمای سبک یا انتخاب ستون، نه فشردگی غیرقابل استفاده.
6. **Accessibility:** Focus قابل دیدن، کنتراست کافی، برچسب مناسب، Keyboard navigation و اندازه هدف لمسی حداقل حدود ۴۴px در طراحی موبایل.
7. **RTL/LTR:** محتوای فارسی راست‌چین، اما Branch، کد، شناسه، لینک و مسیر فایل با جهت مناسب نمایش داده شوند.

### ۶.۲ ساختار صفحات پیشنهادی

| صفحه | عناصر اصلی | اولویت |
|---|---|---|
| Workspace Home | لیست پروژه‌ها، اعضا، فعالیت اخیر | P0 |
| Project Board | Toolbar، View Switcher، ستون‌ها، Quick Add، Filter | P0 |
| Task Drawer / Detail | فیلدها، Checklist، Subtask، Comments، History | P0 |
| Table View | ستون‌ها، Sort، Filter، Bulk Actions با مجوز | P1 |
| Calendar View | ماه/هفته، Due Date، Task بدون تاریخ | P1 |
| Backlog / Sprint | اولویت‌ها، Sprint Planner و Goal | P1 |
| Project Settings | Workflow، Labels، Custom Fields، Permissions | P1 |
| Notifications Inbox | فهرست اعلان‌ها و Prefs | P1 |
| Reports | نمودارهای عملیاتی و فیلتر بازه | P1 |
| Timeline / Automation / Integrations | بخش‌های پیشرفته قابل فعال‌سازی | P2 |

### ۶.۳ نمونه جریان کارت

`Board → Open Task Drawer → Edit Fields → Add Checklist → Assign User → Move to Review → Reviewer Comment → Complete → Activity Recorded`

**ریزتعامل‌ها:** Skeleton هنگام Load، Toast موفقیت/شکست، حالت Undo برای اقدامات قابل برگشت، Tooltip برای برچسب‌های کوتاه، Badge هشدار Overdue، نشان Blocked و Focus restoration پس از بستن Drawer.

---

## ۷. مدل داده منطقی پیشنهادی (قابل تطبیق با Schema فعلی)

**هشدار:** این مدل صرفاً پیشنهاد مرجع است؛ نباید بدون مطالعه Schema فعلی Migration خودکار روی دیتابیس اجرا شود.

### ۷.۱ موجودیت‌ها

| Entity | فیلدهای اصلی یا نقش | رابطه |
|---|---|---|
| Workspace | id, name, ownerId, settings | دارای Project و Member |
| Project | id, workspaceId, name, key, visibility | دارای Task و Workflow |
| BoardView | id, projectId, type, filters, groupBy, sortBy, visibility | نمای Taskهای Project |
| WorkflowStatus | id, projectId, name, order, category, isTerminal | وضعیت قابل تنظیم |
| WorkflowTransition | fromId, toId, conditions, permissions | قانون تغییر وضعیت |
| Task | id, publicKey, projectId, statusId, title, ..., position, version | موجودیت مشترک |
| TaskAssignee | taskId, userId | چندمسئولی در صورت نیاز |
| TaskLabel / Label | taskId, labelId / name, color | دسته‌بندی |
| Checklist / ChecklistItem | taskId, title, isCompleted, position | کنترل پیشرفت |
| TaskRelation | sourceTaskId, targetTaskId, type | dependency و related |
| Comment | taskId, authorId, body, editedAt | گفتگو |
| Attachment | taskId, uploaderId, metadata, storageKey | فایل و مجوز |
| ActivityEvent | id, taskId, actorId, eventType, before, after, timestamp | ثبت تغییرات |
| Sprint | projectId, name, goal, start/end, state | برنامه‌ریزی |
| SprintTask | sprintId, taskId | عضویت در Sprint |
| Milestone | projectId, name, dueDate, state | اهداف انتشار |
| CustomFieldDefinition | projectId, name, type, options | تعریف فیلد |
| CustomFieldValue | taskId, fieldId, typedValue | مقدار فیلد |
| Notification | recipientId, eventId, readAt | اعلان |
| AutomationRule / Run | trigger, condition, action, state / execution log | اتوماسیون |
| IntegrationConnection | projectId, provider, scopes, secretRef | اتصال به Git |
| ExternalLink | taskId, provider, type, url, externalId | Branch/MR/PR |

### ۷.۲ نکات کلیدی Schema

- `Task.statusId` وضعیت canonical است؛ `BoardView` داده را تکثیر نمی‌کند.
- `Task.position` یا کلید ترتیبی باید برای جابه‌جایی در لیست قابل استفاده باشد؛ انتخاب integer/fractional indexing باید با حجم داده و Concurrency سنجیده شود.
- `Task.version` یا ETag برای **optimistic concurrency** توصیه می‌شود.
- Task Public Key (مثل `APP-104`) با Primary Key داخلی تفاوت دارد و باید پایدار باشد.
- `parentTaskId` در صورت Subtask، همراه محدودیت جلوگیری از چرخه تعریف شود.
- `AuditEvent` داده محرمانه مثل Token، رمز یا محتوای خصوصی غیرضروری را ذخیره نکند.
- همه تاریخ‌ها برای ذخیره‌سازی به ISO 8601/UTC و برای نمایش براساس Locale/Timezone تبدیل شوند.
- Indexهای پرکاربرد شامل `(projectId, statusId, position)`, `(projectId, dueDate)` و روابط Filter/Assignee با توجه به موتور دیتابیس بررسی شوند.

### ۷.۳ نمونه داده Task (فقط Contract مفهومی)

```json
{
  "id": "task_01",
  "publicKey": "APP-104",
  "projectId": "project_1",
  "title": "Implement login validation",
  "description": "Client-side validation and errors",
  "statusId": "in_progress",
  "priority": "high",
  "assigneeIds": ["user_1"],
  "labelIds": ["frontend", "feature"],
  "startDate": null,
  "dueDate": "2026-11-20",
  "sprintId": null,
  "parentTaskId": null,
  "isBlocked": false,
  "position": "1000",
  "version": 7,
  "archivedAt": null
}
```

**توجه:** `isBlocked` می‌تواند مقدار محاسبه‌شده از روابط باشد، نه فیلد مستقل ذخیره‌شده. در پروژه واقعی فقط یک منبع حقیقت برای آن تعریف شود.

---

## ۸. قراردادهای API پیشنهادی و جریان داده

این مسیرها **مثال مفهومی** هستند؛ اگر API کنونی وجود دارد باید همان مسیرها حفظ یا نسخه‌بندی شوند.

| عملیات | نمونه Endpoint | الزامات |
|---|---|---|
| دریافت Taskهای پروژه | `GET /api/projects/{id}/tasks` | pagination, filter, auth |
| ساخت Task | `POST /api/projects/{id}/tasks` | validation, access, audit |
| تغییر Task | `PATCH /api/tasks/{id}` | partial update, version/ETag |
| انتقال Task | `POST /api/tasks/{id}/move` | status, position, workflow rules |
| دریافت View | `GET /api/projects/{id}/views` | shared/private permission |
| تغییر View | `PATCH /api/views/{id}` | owner/role check |
| تغییر Checklist | `PATCH /api/checklist-items/{id}` | transactional progress |
| کامنت | `POST /api/tasks/{id}/comments` | sanitize, mention validation |
| Activity | `GET /api/tasks/{id}/activities` | pagination, redact sensitive |
| مدیریت Sprint | `POST /api/projects/{id}/sprints` | state transitions |
| Integration Events | `POST /api/integrations/{provider}/webhook` | signature, replay, idempotency |

### ۸.۱ اصول Backend و Frontend

- مسئول اعتبارسنجی نهایی Workflow، WIP، دسترسی و داده ورودی **Backend** است.
- Frontend می‌تواند Optimistic Update انجام دهد، اما باید پاسخ نهایی و Conflict را مدیریت کند.
- برای درخواست‌های قابل تکرار مثل Webhook و Import از Idempotency Key/Unique Event ID استفاده شود.
- `Cursor Pagination` برای Activity/Taskهای حجیم در صورت نیاز؛ در نسخه اولیه می‌توان از Pagination موجود پروژه استفاده کرد.
- فیلدهای ناشناخته یا قابلیت‌های غیرفعال نباید باعث از کار افتادن Clientهای قدیمی شوند.
- رویدادهای Real-time فقط اطلاع از تغییر هستند؛ هنگام Disconnect باید امکان Re-fetch/Resync وجود داشته باشد.

---

## ۹. دسترسی، امنیت، حریم خصوصی و تاب‌آوری

### ۹.۱ ماتریس مجوز نمونه

| عملیات | Owner/Admin | Manager | Member | Reviewer | Viewer |
|---|---|---|---|---|---|
| دیدن Task مجاز | بله | بله | بله | بله | بله |
| ساخت Task | بله | بله | بسته به سیاست | بسته به سیاست | خیر |
| تغییر Task | بله | بله | طبق مسئول/پروژه | محدود | خیر |
| تغییر Workflow | بله | طبق مجوز | خیر | خیر | خیر |
| مدیریت اعضا | بله | طبق مجوز | خیر | خیر | خیر |
| مدیریت Integration / Automation | بله | طبق مجوز | خیر | خیر | خیر |
| مشاهده Audit / Reports | بله | طبق مجوز | محدود | محدود | طبق مجوز |

**اصل:** دسترسی بر اساس Project Membership و نقش/Policy محاسبه می‌شود؛ نمایش UI به‌تنهایی مجوز محسوب نمی‌شود.

### ۹.۲ الزامات امنیتی

- جلوگیری از XSS در Description و Comments؛ Sanitization و Content Security Policy متناسب با Stack.
- اعتبارسنجی نوع و اندازه Upload، دسترسی دانلود و جلوگیری از Path Traversal.
- محدودیت Rate برای Endpoints حساس و حفاظت در برابر Requestهای تکراری.
- رمزگذاری انتقال با HTTPS؛ Secretها در Secret Store یا محیط امن سرور، نه در Git یا Browser.
- Logs نباید Credential، Token، Comment خصوصی یا اطلاعات حساس غیرلازم را افشا کنند.
- Backup/Restore و Audit برای Migration و عملیات انبوه.
- کاربران اخراج‌شده از Workspace بلافاصله از مشاهده منابع محافظت‌شده محروم شوند.

---

## ۱۰. نیازمندی‌های غیرفункسیونی (NFR)

| شناسه | نیاز | معیار پیشنهادی / روش آزمون |
|---|---|---|
| NFR-01 | سازگاری | بدون حذف داده و شکست جریان‌های فعلی؛ Regression Test |
| NFR-02 | عملکرد Board | بارگذاری و تعامل با حجم نمونه واقعی و p95 قابل قبول؛ Benchmark قبل/بعد |
| NFR-03 | مقیاس‌پذیری | Virtualization/Pagination برای پروژه‌های پرکارت؛ آزمایش داده حجیم |
| NFR-04 | دسترس‌پذیری | مسیرهای اصلی Keyboard، Focus، Contrast؛ آزمون دستی و خودکار |
| NFR-05 | Responsive | دسکتاپ، تبلت و موبایل؛ تست Touch/Scroll |
| NFR-06 | بومی‌سازی | فارسی RTL و متن‌های LTR؛ تست ترکیب شناسه/تاریخ/کد |
| NFR-07 | قابلیت اطمینان | شکست شبکه و درخواست هم‌زمان بدون تخریب داده |
| NFR-08 | مشاهده‌پذیری | Error logging، Metrics و Trace IDs بدون داده محرمانه |
| NFR-09 | سازگاری API | Versioning یا Contract Tests؛ Client قدیمی محفوظ |
| NFR-10 | نگهداشت‌پذیری | تست واحد/Integration، ساختار ماژولار، مستندات تصمیم‌های مهم |
| NFR-11 | پشتیبان‌گیری | Backup معتبر پیش از Migration و بازگردانی آزمایش‌شده |
| NFR-12 | امنیت | تست مجوزهای افقی/عمودی، XSS، Upload، Webhook |

**اعداد قطعی Performance و Availability باید پس از Baseline و براساس زیرساخت واقعی تصویب شوند.**

---

## ۱۱. برنامه اجرا و انتشار مرحله‌ای (Incremental Roadmap)

### Phase 0 — Discovery & Baseline (پیش‌شرط همه فازها)

**خروجی:** Inventory واقعی قابلیت‌ها، Status Matrix برای `FR-01..FR-30`، نقشه ماژول‌ها، Dependency Map، ریسک‌ها و Test Baseline.  
**شرط ورود به کدنویسی:** تأیید معماری فعلی و انتخاب مسیر حفظ/تکمیل/افزودن برای هر Feature.

### Release 1 — تثبیت تجربه اصلی Board

**Scope:** `FR-01,02,03,04,05,06,07,09,11,29,30` و `FR-08` در صورت زیرساخت آماده.  
**Outcome:** Task CRUD قابل اعتماد، Board روان، داده پایدار، Workflow پایه، Activity Log، نقش‌ها، جست‌وجو و بازیابی.  
**Gate:** تمام سناریوهای Smoke/Regression/Permission/Mobile موفق، بدون Data Loss.

### Release 2 — همکاری و نمایش منعطف

**Scope:** `FR-10,12,14,16,19,21`؛ همچنین بهبود Comments و Saved Filters.  
**Outcome:** چندنما، Subtask، Attachment، Inbox، WIP Warning و View شخصی/اشتراکی.  
**Gate:** یکسانی Task در Board/Table/Calendar، جلوگیری از دسترسی غیرمجاز، عدم افت شدید Performance.

### Release 3 — برنامه‌ریزی و توسعه نرم‌افزار

**Scope:** `FR-13,15,18,20,22,23,25,28`.  
**Outcome:** Backlog/Sprint، Dependency، Custom Field، Template، Milestone، لینک Git و داشبورد.  
**Gate:** صحت محاسبات گزارش و سازگاری روابط، بدون خرابی داده‌های قبلی.

### Release 4 — قابلیت‌های پیشرفته اختیاری

**Scope:** `FR-17,24,26,27` شامل Timeline/Gantt، Webhook واقعی، اتوماسیون و Collaboration بلادرنگ.  
**Outcome:** شخصی‌سازی و اتصال پیشرفته قابل فعال‌سازی برای پروژه‌های نیازمند.  
**Gate:** ایمنی Automation، idempotency، مدیریت Secret، تحمل قطع اتصال و بار واقعی.

**توجه:** هر Release می‌تواند به چند Sprint/Issue کوچک تقسیم شود؛ این سند مدت‌زمان یا تاریخ تحویل ساختگی تعیین نمی‌کند.

### ۱۱.۱ وابستگی‌های مهم

- `FR-09` Activity History پیش‌نیاز مفید `FR-21` اعلان‌ها، `FR-25` گزارش‌ها و `FR-26` اتوماسیون است.
- `FR-02/03` Workflow/Task پایه قبل از Sprint، Dependency و نماهای پیشرفته باید پایدار شوند.
- `FR-11` Permissions پیش‌شرط Files، Private Views، Integrations و Rule Execution است.
- `FR-16` Multiple Views به یک Task canonical و Query/Filter مشترک وابسته است.
- `FR-23` لینک‌کردن Git می‌تواند مستقل و قبل از `FR-24` Webhook عرضه شود.

---

## ۱۲. روش پیاده‌سازی سازگار با کد موجود

### ۱۲.۱ چرخه توسعه هر Feature

1. **Inspect:** فایل‌ها، Componentها، سرویس‌ها، API و Schema مربوط را شناسایی کن.
2. **Classify:** `Existing/Improve/Add/Defer`، به‌همراه دلیل کوتاه.
3. **Design:** قرارداد داده، UX State، Edge Case و Migration را طراحی کن.
4. **Implement:** تغییرات محدود در ماژول موجود، بدون Refactor گسترده غیرضروری.
5. **Test:** Unit، Integration، E2E و Regression مرتبط را اجرا کن.
6. **Review:** تفاوت UI و API را بازبینی کن؛ Permission و Performance را بسنج.
7. **Release:** پشت Feature Flag یا Rollout مرحله‌ای در صورت ریسک بالا فعال کن.
8. **Document:** Change Log، تصمیم فنی، API تغییرکرده، محدودیت و Rollback را ثبت کن.

### ۱۲.۲ Feature Flag و Migration

- Featureهای بزرگ مثل Sprint، Automation و Git Webhook ابتدا برای محیط Test یا پروژه‌های منتخب فعال شوند.
- Migrationهای افزایشی و قابل برگشت ترجیح دارند؛ `expand → migrate/backfill → verify → contract` برای تغییر Schema پیشنهاد می‌شود.
- `Backfill` باید Idempotent باشد و اجرای دوباره داده را تکثیر نکند.
- هیچ داده‌ای به دلیل افزودن Custom Field، View یا Workflow جدید بی‌صدا حذف نشود.
- برای تغییرات مخرب، نسخه پشتیبان و سناریوی Rollback پیش از Release لازم است.

### ۱۲.۳ دسته‌بندی خروجی‌های مهندسی

برای هر Issue توسعه باید ثبت شود: شناسه FR، وضعیت فعلی، تغییر دقیق، فایل/ماژول‌های درگیر، Migration، معیار پذیرش، Testها، ریسک، تصویر قبل/بعد (در صورت UI)، لینک Commit/MR و نتیجه انتشار.

---

## ۱۳. راهبرد آزمون و پذیرش نهایی

### ۱۳.۱ مجموعه تست بحرانی (Critical End-to-End Scenarios)

| Test ID | سناریو | نتیجه مورد انتظار |
|---|---|---|
| E2E-01 | ساخت Task و Refresh | Task با شناسه و اطلاعات ثابت برگردد |
| E2E-02 | Drag بین ستون‌ها + Refresh | وضعیت و ترتیب تغییرشده حفظ شود |
| E2E-03 | Drag با خطای API | Recovery و پیام خطای قابل درک |
| E2E-04 | دو کاربر هم‌زمان یک Task را ویرایش کنند | Conflict بدون Data Loss مدیریت شود |
| E2E-05 | تلاش Viewer برای تغییر Task از API | 403 یا پاسخ امن مناسب |
| E2E-06 | تغییر Task در Table و نمایش در Board | داده یکسان باشد |
| E2E-07 | ثبت CheckItem و محاسبه درصد | Progress درست باشد |
| E2E-08 | تغییر Workflow با Taskهای موجود | هیچ Task بدون وضعیت معتبر نماند |
| E2E-09 | Upload فایل + دسترسی غیرمجاز به دانلود | دانلود غیرمجاز رد شود |
| E2E-10 | Mention یا Notification پس از لغو عضویت | اطلاعات پروژه افشا نشود |
| E2E-11 | ساخت رابطه بلوکه‌کننده چرخه‌ای | عملیات رد شود |
| E2E-12 | پایان Sprint با Task ناتمام | Task باقی بماند و مقصد تعیین شود |
| E2E-13 | تکرار Webhook | تنها یک اثر منطقی تولید شود |
| E2E-14 | Automation با Trigger حلقه‌ای | Loop متوقف و ثبت شود |
| E2E-15 | آرشیو و بازیابی Task | تمام داده‌های مرتبط حفظ شوند |
| E2E-16 | کار با کیبورد و موبایل | مسیرهای اصلی انجام‌پذیر باشند |
| E2E-17 | نمایش تاریخ/کد فارسی و انگلیسی در RTL | ترتیب بصری و خوانایی درست باشد |

### ۱۳.۲ Definition of Done برای هر Feature

- معیار پذیرش مشخص، تست‌شده و مستند است.
- قابلیت قبلی مرتبط Regression نشده است.
- Validation و Authorization سمت سرور بررسی شده‌اند.
- UI در Loading/Empty/Error/Success و Responsive آزموده شده است.
- Accessibility و RTL/LTR در صورت ارتباط تأیید شده‌اند.
- Migration (در صورت نیاز) آزمایش و Rollback مستند است.
- Logging/Monitoring/Feature Flag برای تغییر پرریسک آماده است.
- مستندات توسعه و Change Log به‌روز شده‌اند.

### ۱۳.۳ معیار پذیرش کل برنامه

**PRD زمانی اجراشده تلقی می‌شود که** تمام `P0`های قابل اعمال با موفقیت کار کنند، هیچ داده قدیمی از دست نرفته باشد، `P1`ها مطابق Release پذیرفته شده باشند، قابلیت‌های `P2` فقط مطابق نیاز و تصمیم محصول فعال شوند و گزارش ممیزی نشان دهد کدام FR دقیقاً پیاده‌سازی، بهبود، تعویق یا رد شده است.

---

## ۱۴. ریسک‌ها، تصمیم‌ها و موارد خارج از دامنه

### ۱۴.۱ ریسک‌های اصلی

| ریسک | اثر | اقدام کاهشی |
|---|---|---|
| بازنویسی موازی ماژول موجود | بدهی فنی و داده ناسازگار | ممیزی و reuse-first |
| ناسازگاری Schema و Migration | از دست رفتن داده | Backups، Backfill، Rollback |
| هم‌زمانی در Drag / Edit | ترتیب و وضعیت اشتباه | Versioning و Conflict Handling |
| زیادشدن امکانات روی کارت | آشفتگی UI | Progressive Disclosure |
| کندی بردهای شلوغ | تجربه نامطلوب | Pagination/Virtualization/Indexes |
| Automation اشتباه | تغییرات تکراری یا انبوه | Dry Run، Execution Limits، Audit |
| Webhook تقلبی یا تکراری | تغییر وضعیت غلط | Signature + Idempotency |
| Permissions ناقص | افشای اطلاعات | Policy Tests و API Authorization |
| نمایش اشتباه RTL/LTR | اختلال در شناسه‌ها و کد | تست بومی‌سازی |

### ۱۴.۲ موارد خارج از دامنه نسخه‌های اولیه

- ساخت سرویس مستقل Git Hosting یا CI/CD از صفر.
- ساخت موتور Document Editor هم‌سطح Notion به‌جای توضیحات Task؛ Rich Text سبک کافی است.
- موتور Automation عمومی و بدون محدودیت در R1.
- تغییر اجباری کل فناوری‌ها، Design System یا ساختار URLهای فعلی.
- حذف مدل فعلی Task فقط برای تطبیق نام موجودیت‌ها با ابزارهای مرجع.
- راه‌اندازی هم‌زمان تمام امکانات پیشرفته بدون سنجش تقاضا.

### ۱۴.۳ تصمیم‌های باز (باید پس از Audit تعیین شوند)

1. فناوری‌های Frontend/Backend/Database موجود و محدودیت‌های آن‌ها چیست؟
2. Taskها اکنون در چه Schema و APIهایی ذخیره می‌شوند؟
3. کاربران چند Workspace/Project دارند و مدل نقش فعلی چیست؟
4. وضعیت‌های فعلی با Column یکسان‌اند یا دو مفهوم مستقل؟
5. اولویت اول کسب‌وکار: تیم نرم‌افزاری، تیم عمومی یا هر دو است؟
6. آیا فارسی RTL و تقویم جلالی برای محصول نهایی لازم و فعال‌اند؟
7. سقف واقعی Taskها، کاربران هم‌زمان، فایل‌ها و Performance Budget چیست؟
8. کدام قابلیت‌ها باید در پلن یا نقش خاص فعال شوند؟
9. آیا Git Integration صرفاً Link است یا OAuth/Webhook نیز در Roadmap واقعی قرار دارد؟
10. سیاست Data Retention، Audit، Import/Export و حذف دائمی چیست؟

**تا زمان پاسخ با شواهد واقعی، انتخاب فنی نهایی در این موارد قطعی نیست.**

---

## ۱۵. Backlog اولیه قابل تبدیل به Issue

| Issue پیشنهادی | وابستگی | خروجی قابل تحویل | Definition of Done کوتاه |
|---|---|---|---|
| DISC-001: Audit existing board | ندارد | Current-State Matrix + File Map | وضعیت همه FRها مشخص |
| CORE-001: Workflow & columns | DISC-001 | تنظیمات ستون و Status | AC-01 پاس شود |
| CORE-002: Task detail enhancement | DISC-001 | پنل کامل جزئیات | AC-03 پاس شود |
| CORE-003: Reliable drag-drop | CORE-001 | Drag همراه Rollback | AC-04 پاس شود |
| CORE-004: Activity/audit | CORE-002 | ثبت تغییرات اصلی | AC-09 پاس شود |
| CORE-005: Permissions regression | DISC-001 | کنترل مجوزها | E2E-05 پاس شود |
| CORE-006: Search/filter consistency | CORE-002 | Query مشترک | AC-07 پاس شود |
| COLLAB-001: Checklist/subtask | CORE-002 | ساختار مراحل و زیرتسک | AC-06/12 پاس شود |
| COLLAB-002: Comments/files | CORE-005 | گفتگو و فایل امن | AC-08/10 پاس شود |
| VIEW-001: Shared view architecture | CORE-006 | Board/Table/Calendar | AC-16 پاس شود |
| VIEW-002: Saved views | VIEW-001 | نماهای Private/Shared | AC-19 پاس شود |
| PLAN-001: Backlog & sprints | CORE-001 | Sprint lifecycle | AC-13 پاس شود |
| PLAN-002: Dependency graph | COLLAB-001 | Blocked/Related | AC-15 پاس شود |
| CONFIG-001: Custom fields/templates | CORE-002 | تعریف و استفاده مجدد | AC-18/20 پاس شود |
| INTEG-001: Git link fields | CORE-002 | Repo/Branch/MR links | AC-23 پاس شود |
| REPORT-001: Project dashboard | CORE-004 | شاخص‌ها و نمودارها | AC-25 پاس شود |
| ADV-001: Git webhook integration | INTEG-001 | Sync امن Provider | AC-24 پاس شود |
| ADV-002: Automation engine | CORE-004 + CORE-005 | Rule/Run/Logs | AC-26 پاس شود |
| ADV-003: Timeline/Gantt | VIEW-001 + PLAN-002 | زمان‌بندی وابستگی | AC-17 پاس شود |

این Backlog **پیشنهادی** است؛ قبل از ایجاد Issue واقعی باید با Repo و Issueهای فعلی تطبیق داده شود تا تسک تکراری ساخته نشود.

---

## ۱۶. دستورالعمل استفاده از PRD توسط Agent توسعه

**هدف Agent:** اجرای تدریجی الزامات این سند روی پروژه موجود با کمترین تغییر مخرب.

**قواعد غیرقابل‌چشم‌پوشی:**

1. **ابتدا کد را بخوان، بعد پیشنهاد بده و اجرا کن.** بدون بررسی ساختار واقعی، هیچ فیچر جدیدی را از صفر دوباره نساز.
2. برای هر `FR` وضعیت `Already implemented / Needs enhancement / Missing / Deferred` را همراه مسیر فایل و مدرک بنویس.
3. معماری، Design System، API و Git Workflow موجود را حفظ کن، مگر تغییر با دلیل فنی و تأیید لازم باشد.
4. هر مرحله فقط یک بخش منطقی کوچک؛ تغییرهای بزرگ بدون تست و Rollback ممنوع.
5. پس از هر تغییر: فهرست فایل‌های تغییرکرده، دلیل، تست‌های اجراشده، تست‌های اجرا‌نشده، باگ‌ها و ریسک‌های باقی‌مانده را گزارش کن.
6. از ادعای «انجام‌شده» برای Feature بدون تست پذیرش خودداری کن.
7. همگام‌سازی Git و Commit/Push فقط براساس دسترسی و دستورالعمل واقعی Repo انجام شود؛ تغییرات حل‌نشده دیگران را بازنویسی نکن.
8. اسناد و نام‌های نمایشی محصول را متناسب با زبان فعلی پروژه نگه دار؛ Technical Identifiers انگلیسی بمانند.

### قالب گزارش اجرای هر Feature

```text
Feature ID:
Current implementation / evidence:
Classification: Existing | Improve | Add | Defer
Files and modules affected:
Proposed UX / API / data changes:
Migration and backward compatibility:
Acceptance criteria covered:
Tests run and results:
Regression and security checks:
Known limitations / risks:
Commit / MR reference (if applicable):
Rollout / rollback strategy:
```

---

## ۱۷. پیوست: منابع الهام و نگاشت قابلیت‌ها

این PRD الزام به کپی‌کردن UX یا کد ابزارهای دیگر ایجاد نمی‌کند؛ منابع صرفاً برای مطالعه الگوهای محصول هستند.

- Trello — Boards, Cards, Automation: https://trello.com/en/guide/trello-101
- Jira — Boards, Scrum, Backlog: https://www.atlassian.com/software/jira/guides/boards/overview
- GitLab — Issue Boards: https://docs.gitlab.com/user/project/issue_board/
- GitLab — Merge Requests and Issues: https://docs.gitlab.com/user/project/issues/
- Notion — Projects & Tasks: https://www.notion.com/help/guides/getting-started-with-projects-and-tasks

### جمع‌بندی نهایی تصمیم محصول

**نسخه پایه را ساده، قابل اعتماد و قابل فهم نگه دارید؛ داده‌ها را یکپارچه طراحی کنید؛ قابلیت‌های Jira/GitLab/Notion را به‌عنوان لایه‌های توسعه‌پذیر و اختیاری روی همان هسته اضافه کنید.** هر قابلیت فقط پس از تأیید وضعیت فعلی، تست سازگاری و داشتن معیار پذیرش روشن وارد برنامه اجرا شود.

**پایان سند — PRD v1.0**
