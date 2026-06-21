import re
import os

files = [
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\App.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\components\CallHistoryPanel.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\context\Store.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\graph\KnowledgeGraph.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\graph\graphEngine.ts",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\layouts\MainLayout.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\views\Analytics.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\views\Comm.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\views\DistrictMinistryDashboard.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\views\EducationDept.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\views\HealthDept.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\views\Projects.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\views\Suggestions.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\views\DMView.tsx",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\Backend\src\utils\seed.ts",
    r"c:\Users\Sparsh gupta\Documents\Web Dev\Projects\NagarVaani_Web\CM_Frontend\src\index.css"
]

def clean_file(path):
    if not os.path.exists(path):
        print(f"Skipping (does not exist): {path}")
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace JSX comments including curly braces, e.g., {/* comment */}
    content = re.sub(r'\{\s*/\*.*?\*/\s*\}', '', content, flags=re.DOTALL)

    # 2. Replace regular comments, keeping string literals intact
    # Alternation order: string literals first to avoid matching inside strings
    pattern = re.compile(
        r'(?P<string>\'(?:\\\'|[^\'])*\'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`)|//.*?$|/\*.*?\*/',
        re.DOTALL | re.MULTILINE
    )
    
    def replacer(match):
        if match.group('string') is not None:
            return match.group('string')
        return ''
    
    content = pattern.sub(replacer, content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully cleaned: {path}")

for f in files:
    clean_file(f)
