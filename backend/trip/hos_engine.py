# trip/hos_engine.py

# ── Constants ──────────────────────────────────────────
MAX_DRIVING_PER_SHIFT    = 11      # hours driving per shift
MAX_WINDOW_PER_SHIFT     = 14      # hours from shift start
REQUIRED_REST            = 10      # hours off duty
BREAK_AFTER_DRIVING      = 8       # hours before 30-min break
BREAK_DURATION           = 0.5     # 30 minutes
MAX_CYCLE_HOURS          = 70      # 70hr / 8day rule
FUEL_INTERVAL_MILES      = 1000    # fuel every 1000 miles
PICKUP_DURATION          = 1.0     # 1 hour on-duty at pickup
DROPOFF_DURATION         = 1.0     # 1 hour on-duty at dropoff
AVERAGE_SPEED_MPH        = 55      # assumed driving speed


def build_schedule(total_miles, cycle_used):
    schedule = []
    current_day = []

    miles_remaining = total_miles
    cycle_hours_used = float(cycle_used)

    shift_driving = 0.0
    shift_window = 0.0
    driving_since_break = 0.0
    fuel_miles = 0.0

    current_day_total = 0.0

    def close_day():
        nonlocal current_day, current_day_total
        day_total = sum(s['duration'] for s in current_day)
        remaining = 24 - day_total
        if remaining > 0.01:
            add_segment("off_duty", round(remaining, 4), "Off Duty")
        if current_day:
            schedule.append(current_day)
        current_day = []
        current_day_total = 0.0

    def add_segment(seg_type, duration, label, miles=0):
        nonlocal current_day_total
        current_day.append({
            "type": seg_type,
            "duration": round(duration, 4),
            "label": label,
            "miles": round(miles, 2)
        })
        current_day_total += duration

    def add_rest(duration, label):
        nonlocal current_day_total
        remaining_rest = duration

        while remaining_rest > 0.001:
            hours_left_today = 24 - current_day_total

            if hours_left_today <= 0.01:
                schedule.append(current_day[:])
                current_day.clear()
                current_day_total = 0.0
                continue

            if remaining_rest <= hours_left_today:
                add_segment("off_duty", round(remaining_rest, 4), label)
                remaining_rest = 0
            else:
                add_segment("off_duty", round(hours_left_today, 4), label)
                remaining_rest -= hours_left_today
                schedule.append(current_day[:])
                current_day.clear()
                current_day_total = 0.0

    add_segment("on_duty_not_driving", PICKUP_DURATION, "Pickup")
    shift_window += PICKUP_DURATION
    cycle_hours_used += PICKUP_DURATION

    while miles_remaining > 0.001:

        cycle_remaining = MAX_CYCLE_HOURS - cycle_hours_used
        if cycle_remaining <= 0:
            add_rest(34.0, "34-Hour Restart")
            close_day()
            cycle_hours_used = 0
            shift_driving = 0
            shift_window = 0
            driving_since_break = 0
            continue

        driving_available = min(
            MAX_DRIVING_PER_SHIFT - shift_driving,
            MAX_WINDOW_PER_SHIFT - shift_window,
            cycle_remaining
        )

        if driving_available <= 0:
            add_rest(REQUIRED_REST, "Required Rest (10 hrs)")
            close_day()
            shift_driving = 0
            shift_window = 0
            driving_since_break = 0
            continue

        if driving_since_break >= BREAK_AFTER_DRIVING:
            add_rest(BREAK_DURATION, "30-Min Rest Break")
            shift_window += BREAK_DURATION
            driving_since_break = 0
            continue

        hours_until_break = BREAK_AFTER_DRIVING - driving_since_break
        hours_can_drive = min(driving_available, hours_until_break)

        miles_to_fuel = FUEL_INTERVAL_MILES - fuel_miles
        hours_to_fuel = miles_to_fuel / AVERAGE_SPEED_MPH

        if hours_to_fuel <= hours_can_drive:
            actual_miles = min(miles_to_fuel, miles_remaining)
            actual_hours = actual_miles / AVERAGE_SPEED_MPH

            add_segment("driving", actual_hours, "Driving", actual_miles)

            shift_driving += actual_hours
            shift_window += actual_hours
            driving_since_break += actual_hours
            cycle_hours_used += actual_hours
            miles_remaining -= actual_miles
            fuel_miles = 0

            if miles_remaining <= 0.001:
                break

            add_segment("on_duty_not_driving", 0.5, "Fuel Stop")

            shift_window += 0.5
            cycle_hours_used += 0.5
            driving_since_break = 0

        else:
            actual_hours = min(
                hours_can_drive,
                miles_remaining / AVERAGE_SPEED_MPH
            )

            actual_miles = actual_hours * AVERAGE_SPEED_MPH

            add_segment("driving", actual_hours, "Driving", actual_miles)

            shift_driving += actual_hours
            shift_window += actual_hours
            driving_since_break += actual_hours
            cycle_hours_used += actual_hours
            miles_remaining -= actual_miles
            fuel_miles += actual_miles

    add_segment("on_duty_not_driving", DROPOFF_DURATION, "Dropoff")
    close_day()

    return schedule

def summarize_schedule(schedule):
    """
    Returns totals per day and overall trip summary.
    """
    summary = []
    total_driving = 0
    total_rest    = 0
    total_on_duty = 0

    for i, day in enumerate(schedule):
        day_driving  = sum(s["duration"] for s in day if s["type"] == "driving")
        day_rest     = sum(s["duration"] for s in day if s["type"] == "off_duty")
        day_on_duty  = sum(s["duration"] for s in day
                          if s["type"] == "on_duty_not_driving")
        day_miles    = sum(s["miles"]    for s in day)

        total_driving += day_driving
        total_rest    += day_rest
        total_on_duty += day_on_duty

        summary.append({
            "day":          i + 1,
            "driving_hrs":  round(day_driving, 2),
            "rest_hrs":     round(day_rest, 2),
            "on_duty_hrs":  round(day_on_duty, 2),
            "miles_driven": round(day_miles, 2),
            "segments":     len(day)
        })

    return {
        "days":          len(schedule),
        "total_driving": round(total_driving, 2),
        "total_rest":    round(total_rest, 2),
        "total_on_duty": round(total_on_duty, 2),
        "day_summaries": summary
    }