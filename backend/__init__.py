import sys
from pathlib import Path

# Add backend directory and parent root directory to sys.path
_pkg_dir = Path(__file__).resolve().parent
_root_dir = _pkg_dir.parent

if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))
if str(_pkg_dir) not in sys.path:
    sys.path.insert(0, str(_pkg_dir))
