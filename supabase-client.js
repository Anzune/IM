const SUPABASE_URL = 'https://osdkebkysajinlzqbfbw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MvDdoib5b8UCOK_NZVOV-Q_Xs-0Qmer';

const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = function() {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase connected!');
};
document.head.appendChild(script);

export async function signUp(email, password, userData) {
    const { data, error } = await window.supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: userData.firstName,
                last_name: userData.lastName,
            }
        }
    });
    
    if (error) throw error;
    
    if (data.user) {
        const { error: profileError } = await window.supabase
            .from('profiles')
            .insert([{
                id: data.user.id,
                email: email,
                first_name: userData.firstName,
                last_name: userData.lastName,
                year_level: userData.yearLevel,
                section: userData.section,
                course: userData.course,
                role: 'user'
            }]);
        
        if (profileError) throw profileError;
    }
    
    return data;
}

export async function signIn(email, password) {
    const { data, error } = await window.supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await window.supabase.auth.signOut();
    if (error) throw error;
}

export async function getProfile(userId) {
    const { data, error } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
}

export async function updateProfile(userId, updates) {
    const { data, error } = await window.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function getAllRooms() {
    const { data, error } = await window.supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('floor')
        .order('room_name');
    
    if (error) throw error;
    return data;
}

export async function getRoomsByFloor(floor) {
    const { data, error } = await window.supabase
        .from('rooms')
        .select('*')
        .eq('floor', floor)
        .eq('is_active', true)
        .order('room_name');
    
    if (error) throw error;
    return data;
}

export async function getRoomByName(roomName) {
    const { data, error } = await window.supabase
        .from('rooms')
        .select('id, room_name')
        .eq('room_name', roomName)
        .single();
    
    if (error) throw error;
    return data;
}

export async function checkRoomAvailability(roomId, date, startTime, endTime) {
    const { data, error } = await window.supabase
        .rpc('check_room_availability', {
            p_room_id: roomId,
            p_date: date,
            p_start_time: startTime,
            p_end_time: endTime
        });
    
    if (error) throw error;
    return data;
}

export async function createReservation(data) {
    const { data: result, error } = await window.supabase
        .from('reservations')
        .insert([data])
        .select()
        .single();
    
    if (error) throw error;
    return result;
}

export async function getUserReservations(userId) {
    const { data, error } = await window.supabase
        .from('reservations')
        .select(`
            *,
            rooms:room_id (*)
        `)
        .eq('user_id', userId)
        .order('reservation_date', { ascending: true });
    
    if (error) throw error;
    return data;
}

export async function getActiveReservation(userId) {
    const { data, error } = await window.supabase
        .from('reservations')
        .select(`
            *,
            rooms:room_id (*)
        `)
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed'])
        .gte('reservation_date', new Date().toISOString().split('T')[0])
        .order('reservation_date', { ascending: true })
        .limit(1)
        .maybeSingle();
    
    if (error) throw error;
    return data;
}

export async function cancelReservation(reservationId) {
    const { data, error } = await window.supabase
        .from('reservations')
        .update({ 
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
        })
        .eq('id', reservationId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function confirmReservation(reservationId) {
    const { data, error } = await window.supabase
        .from('reservations')
        .update({ 
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
        })
        .eq('id', reservationId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function createCheckIn(data) {
    const { data: result, error } = await window.supabase
        .from('check_ins')
        .insert([data])
        .select()
        .single();
    
    if (error) throw error;
    return result;
}

export async function completeCheckIn(checkInId) {
    const { data, error } = await window.supabase
        .from('check_ins')
        .update({ 
            check_out_time: new Date().toISOString(),
            status: 'completed'
        })
        .eq('id', checkInId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function logActivity(userId, action, details = {}) {
    const { data, error } = await window.supabase
        .from('activity_logs')
        .insert([{
            user_id: userId,
            action: action,
            details: details
        }]);
    
    if (error) console.error('Error logging activity:', error);
    return data;
}
