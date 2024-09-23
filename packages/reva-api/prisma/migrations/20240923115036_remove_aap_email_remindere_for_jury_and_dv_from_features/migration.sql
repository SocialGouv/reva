delete from features
where
    key in (
        'batch.send-reminder-to-organism-for-candidate-dv-deadline',
        'batch.send-reminder-to-organism-for-candidate-jury-deadline'
    );