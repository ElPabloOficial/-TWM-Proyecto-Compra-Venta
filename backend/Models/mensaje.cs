using System;
using System.Collections.Generic;

namespace backend.api.Models;

public partial class mensaje
{
    public int id { get; set; }

    public string contenido { get; set; } = null!;

    public DateOnly fechaenvio { get; set; }

    public string estado { get; set; } = null!;

    public DateTime? fecharespuesta { get; set; }

    public virtual ICollection<enviar> enviars { get; set; } = new List<enviar>();
}
