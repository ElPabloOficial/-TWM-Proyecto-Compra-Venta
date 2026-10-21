using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class calificacion
{
    public int id { get; set; }

    public string? comentario { get; set; }

    public int calificacion1 { get; set; }

    public DateTime fecha { get; set; }

    public virtual ICollection<escribir1> escribir1s { get; set; } = new List<escribir1>();

    public virtual ICollection<escribir2> escribir2s { get; set; } = new List<escribir2>();
}
