# classify_status 

def classify_status(ping_history):
    """
    Determines status: ONLINE, UNSTABLE, or OFFLINE.

    Rules:
    1. OFFLINE: All pings failed
    2. UNSTABLE: Most pings failed or high latency (>200ms)
    3. ONLINE: Consistent good responses
    """

    if not ping_history:
        return "OFFLINE"
    
    successes = [r for r in ping_history if r is not None]
    failures = [r for r in ping_history if r is None]

    #Rule 1: All failed -> OFFLINE
    if len(successes) == 0:
        return "OFFLINE"
    
    # Rule 2: more failures than successes -> UNSTABLE
    if len(failures) > len(successes):
        return "UNSTABLE"
    
    # Rule 3: High latency ->UNSTABLE
    if successes and (sum(successes) / len(successes)) > 0.2:
        return "UNSTABLE"
    
    # Otherwise -> ONLINE
    return "ONLINE"