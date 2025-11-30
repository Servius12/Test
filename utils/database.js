// Supabase Database functions - replacement for Trickle Database

async function createObject(tableName, data) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { data: result, error } = await client
      .from(tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map to Trickle format for compatibility
    return {
      objectId: result.id,
      objectData: result,
      createdAt: result.created_at,
      updatedAt: result.updated_at || result.created_at
    };
  } catch (error) {
    console.error('Create object error:', error);
    throw error;
  }
}

async function updateObject(tableName, id, data) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { data: result, error } = await client
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map to Trickle format for compatibility
    return {
      objectId: result.id,
      objectData: result,
      createdAt: result.created_at,
      updatedAt: result.updated_at || result.created_at
    };
  } catch (error) {
    console.error('Update object error:', error);
    throw error;
  }
}

async function getObject(tableName, id) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Map to Trickle format for compatibility
    return {
      objectId: data.id,
      objectData: data,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at
    };
  } catch (error) {
    console.error('Get object error:', error);
    throw error;
  }
}

async function listObjects(tableName, limit = 100, orderDesc = true) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    let query = client
      .from(tableName)
      .select('*')
      .limit(limit);
    
    if (orderDesc) {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Map Supabase data to Trickle format for compatibility
    const items = (data || []).map(item => ({
      objectId: item.id,
      objectData: item,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at
    }));
    
    return { items, nextPageToken: null };
  } catch (error) {
    console.error('List objects error:', error);
    return { items: [], nextPageToken: null };
  }
}

async function deleteObject(tableName, id) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { error } = await client
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Delete object error:', error);
    throw error;
  }
}

// Compatibility layer - map old Trickle functions to new Supabase functions
window.trickleCreateObject = createObject;
window.trickleUpdateObject = updateObject;
window.trickleGetObject = getObject;
window.trickleListObjects = listObjects;
window.trickleDeleteObject = deleteObject;