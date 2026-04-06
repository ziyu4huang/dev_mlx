#!/bin/bash
########################################
# Tmux Teammate Launcher
#
# Launches Claude teammates in tmux panes with proper environment inheritance.
# Each teammate runs in its own pane with the glm-team.sh environment sourced.
#
# USAGE:
#   1. Source the base environment first:
#      source /home/ziyu4huang/agent_builder/scripts/glm-team.sh
#
#   2. Run this script:
#      ./scripts/tmux-teammate.sh [command] [options]
#
# COMMANDS:
#   session <name>     - Create a new tmux session for teammates
#   teammate <name>    - Add a new teammate pane to current session
#   list               - List all teammate panes
#   attach <name>      - Attach to a session
#   kill <name>        - Kill a session
#
# EXAMPLES:
#   ./scripts/tmux-teammate.sh session myteam
#   ./scripts/tmux-teammate.sh teammate worker1
#   ./scripts/tmux-teammate.sh attach myteam
########################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GLM_TEAM_SCRIPT="$SCRIPT_DIR/glm-team-source.sh"  # Use source version for environment setup only

# Capture current environment to pass to tmux
capture_env() {
    # Essential environment variables to inherit
    local vars=(
        "Z_AI_API_KEY"
        "Z_AI_MODE"
        "Z_AI_MODEL_DEFAULT"
        "Z_AI_MODEL_OPUS"
        "Z_AI_MODEL_AIR"
        "Z_AI_MODEL_ALTERNATIVE"
        "CLAUDE_TEAM_ID"
        "CLAUDE_TEAM_MEMORY"
        "CLAUDE_CONFIG_DIR"
        "ANTHROPIC_AUTH_TOKEN"
        "ANTHROPIC_BASE_URL"
        "ANTHROPIC_MODEL"
        "PATH"
    )

    local env_string=""
    for var in "${vars[@]}"; do
        if [ -n "${!var:-}" ]; then
            env_string+="export ${var}=\"${!var}\"; "
        fi
    done
    echo "$env_string"
}

# Check if environment is properly set up
check_env() {
    if [ -z "${Z_AI_API_KEY:-}" ]; then
        echo "Error: Z_AI_API_KEY is not set."
        echo "Please run: source $GLM_TEAM_SCRIPT"
        exit 1
    fi
}

# Create a new tmux session for teammates
create_session() {
    local session_name="${1:-claude-team}"

    if tmux has-session -t "$session_name" 2>/dev/null; then
        echo "Session '$session_name' already exists. Use 'attach' to connect."
        exit 1
    fi

    check_env

    local env_setup=$(capture_env)

    # Create new session with environment
    tmux new-session -d -s "$session_name" -c "$PROJECT_ROOT" \
        "source $GLM_TEAM_SCRIPT && exec \$SHELL"

    # Set essential environment variables in the session
    tmux set-environment -t "$session_name" Z_AI_API_KEY "$Z_AI_API_KEY"
    tmux set-environment -t "$session_name" Z_AI_MODE "${Z_AI_MODE:-ZAI}"
    tmux set-environment -t "$session_name" Z_AI_MODEL_DEFAULT "${Z_AI_MODEL_DEFAULT:-glm-5}"
    tmux set-environment -t "$session_name" Z_AI_MODEL_OPUS "${Z_AI_MODEL_OPUS:-glm-5}"
    tmux set-environment -t "$session_name" CLAUDE_CONFIG_DIR "${CLAUDE_CONFIG_DIR:-$HOME/.claude-glm}"
    tmux set-environment -t "$session_name" CLAUDE_TEAM_ID "${CLAUDE_TEAM_ID:-claude-teamate}"
    tmux set-environment -t "$session_name" CLAUDE_TEAM_MEMORY "${CLAUDE_TEAM_MEMORY:-true}"
    tmux set-environment -t "$session_name" ANTHROPIC_AUTH_TOKEN "$Z_AI_API_KEY"
    tmux set-environment -t "$session_name" ANTHROPIC_BASE_URL "https://api.z.ai/api/anthropic"
    tmux set-environment -t "$session_name" CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS 1

    echo "Created tmux session: $session_name"
    echo "Run the following to attach:"
    echo "  tmux attach -t $session_name"
    echo ""
    echo "Or add teammates:"
    echo "  $0 teammate worker1"
}

# Add a new teammate pane
add_teammate() {
    local teammate_name="${1:-teammate-$(date +%s)}"
    local session_name=$(tmux display-message -p '#{session_name}' 2>/dev/null || echo "claude-team")

    if ! tmux has-session -t "$session_name" 2>/dev/null; then
        echo "No active session. Create one first:"
        echo "  $0 session myteam"
        exit 1
    fi

    check_env

    # Split window and run teammate with proper environment
    tmux split-window -t "$session_name" -h \
        "echo '=== Teammate: $teammate_name ==='; source $GLM_TEAM_SCRIPT && claude --dangerously-skip-permissions; exec \$SHELL"

    # Rename the pane
    tmux select-pane -t "$session_name" -T "$teammate_name"

    echo "Added teammate '$teammate_name' to session '$session_name'"
}

# List teammate panes
list_teammates() {
    local session_name="${1:-claude-team}"

    if ! tmux has-session -t "$session_name" 2>/dev/null; then
        echo "No session named '$session_name'"
        exit 1
    fi

    echo "Teammates in session '$session_name':"
    tmux list-panes -t "$session_name" -F "  - #{pane_index}: #{pane_title} (#{pane_current_command})"
}

# Attach to session
attach_session() {
    local session_name="${1:-claude-team}"

    if ! tmux has-session -t "$session_name" 2>/dev/null; then
        echo "No session named '$session_name'"
        exit 1
    fi

    tmux attach -t "$session_name"
}

# Kill session
kill_session() {
    local session_name="${1:-claude-team}"

    if ! tmux has-session -t "$session_name" 2>/dev/null; then
        echo "No session named '$session_name'"
        exit 1
    fi

    tmux kill-session -t "$session_name"
    echo "Killed session: $session_name"
}

# Quick start - create session with multiple teammates
quick_start() {
    local session_name="${1:-claude-team}"
    local num_teammates="${2:-2}"

    create_session "$session_name"

    for i in $(seq 1 $num_teammates); do
        sleep 0.5
        add_teammate "worker-$i"
    done

    echo ""
    echo "Quick start complete! Session '$session_name' with $num_teammates teammates."
    echo "Attach with: tmux attach -t $session_name"
}

# Print usage
usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  session <name>       Create a new tmux session"
    echo "  teammate <name>      Add a teammate pane to current session"
    echo "  list [session]       List teammate panes"
    echo "  attach <session>     Attach to a session"
    echo "  kill <session>       Kill a session"
    echo "  quick [name] [n]     Quick start: create session with n teammates"
    echo ""
    echo "Examples:"
    echo "  $0 session myteam          # Create session 'myteam'"
    echo "  $0 teammate researcher     # Add researcher teammate"
    echo "  $0 quick myteam 3          # Create session with 3 teammates"
    echo "  $0 attach myteam           # Attach to session"
}

# Main
case "${1:-}" in
    session)
        create_session "${2:-claude-team}"
        ;;
    teammate)
        add_teammate "${2:-}"
        ;;
    list)
        list_teammates "${2:-claude-team}"
        ;;
    attach)
        attach_session "${2:-claude-team}"
        ;;
    kill)
        kill_session "${2:-claude-team}"
        ;;
    quick)
        quick_start "${2:-claude-team}" "${3:-2}"
        ;;
    *)
        usage
        ;;
esac
